/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.4";

// Type declarations
interface DenoRequest {
  method: string;
  headers: Headers;
  json(): Promise<any>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: DenoRequest) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, repoOwner, repoName, repoId } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    const GITHUB_TOKEN = Deno.env.get('GITHUB_ACCESS_TOKEN');
    const authHeader = req.headers.get('Authorization');

    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    // Define models in order of preference (fallback)
    const models = [
      'anthropic/claude-3-opus',      // Primary choice - most capable
      'anthropic/claude-3-sonnet',    // First fallback - good balance
      'google/gemini-pro',            // Second fallback
      'mistralai/mistral-large'       // Final fallback
    ];

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get last user message
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    
    // Fetch current code from GitHub if repo info provided
    let codeContext = '';
    if (repoOwner && repoName && GITHUB_TOKEN) {
      try {
        const repoContentsUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`;
        const contentsResponse = await fetch(repoContentsUrl, {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        if (contentsResponse.ok) {
          const files = await contentsResponse.json();
          codeContext = `\n\nCurrent repository structure:\n${JSON.stringify(files.slice(0, 10), null, 2)}`;
        }
      } catch (e) {
        console.log('Could not fetch repo contents:', e);
      }
    }

    const systemPrompt = `You are Empirial, an expert AI assistant specializing in web development and GitHub repository management.

Your capabilities:
- Analyze and understand code repositories
- Generate precise code changes and improvements
- Help with debugging and optimization
- Provide clear explanations and best practices
- Commit code changes directly to GitHub when requested

When helping users:
1. Be friendly and conversational (your name is Empirial)
2. Analyze their requests carefully
3. Provide specific, actionable solutions
4. Include file paths and exact code when making changes
5. Explain your reasoning clearly

${codeContext}

Remember: You can directly commit code changes to the user's GitHub repository. When you provide code in markdown code blocks, it will be automatically committed.`;

    // Try models in sequence until one works
    let response;
    let currentModelIndex = 0;
    let lastError;

    while (currentModelIndex < models.length) {
      const currentModel = models[currentModelIndex];
      try {
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://empirialdesigns.co.za',  // Your website URL
            'X-Title': 'Empirial Designs',  // Your app name
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: currentModel,
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages
            ],
            stream: true,
          }),
        });

        if (response.ok) {
          break; // Success! Exit the loop
        }

        // Store the error and try next model
        lastError = await response.text();
        currentModelIndex++;
        
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error occurred';
        currentModelIndex++;
        continue;
      }
    }

    // If we've tried all models and none worked
    if (!response || !response.ok) {
      if (response?.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response?.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please check your OpenRouter API key and credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = response ? await response.text() : 'No response received';
      console.error('AI gateway error:', response?.status ?? 'No status', errorText);
      return new Response(JSON.stringify({ error: 'AI gateway error', details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stream the AI response and try to commit code changes if detected
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let commitUrl = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            fullResponse += chunk;
            controller.enqueue(value);
          }

          // After streaming completes, check if we should commit code
          if (repoOwner && repoName && GITHUB_TOKEN && fullResponse.includes('```')) {
            try {
              // Extract code blocks from response
              const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
              const matches = [...fullResponse.matchAll(codeBlockRegex)];
              
              if (matches.length > 0) {
                // For now, commit the first code block found
                const [, language, code] = matches[0];
                const fileName = language === 'tsx' || language === 'jsx' ? 'src/App.tsx' : 'README.md';
                
                console.log('Attempting to commit code changes...');
                
                // Get current file SHA if it exists
                let sha = '';
                try {
                  const fileResponse = await fetch(
                    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${fileName}`,
                    {
                      headers: {
                        'Authorization': `Bearer ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                      },
                    }
                  );
                  if (fileResponse.ok) {
                    const fileData = await fileResponse.json();
                    sha = fileData.sha;
                  }
                } catch (e) {
                  console.log('File does not exist yet');
                }

                // Commit the changes
                const commitResponse = await fetch(
                  `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${fileName}`,
                  {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${GITHUB_TOKEN}`,
                      'Accept': 'application/vnd.github.v3+json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      message: `AI Edit: ${lastUserMessage.slice(0, 50)}`,
                      content: btoa(code),
                      ...(sha && { sha }),
                    }),
                  }
                );

                if (commitResponse.ok) {
                  const commitData = await commitResponse.json();
                  commitUrl = commitData.commit.html_url;
                  console.log('Code committed successfully:', commitUrl);

                  // Log the edit
                  if (repoId) {
                    await supabaseClient.from('edit_logs').insert({
                      user_id: user.id,
                      repo_id: repoId,
                      file_path: fileName,
                      prompt: lastUserMessage,
                      changes_made: 'AI generated code changes',
                    });
                  }

                  // Send commit URL as additional event
                  const commitEvent = `data: ${JSON.stringify({ commit_url: commitUrl })}\n\n`;
                  controller.enqueue(encoder.encode(commitEvent));
                }
              }
            } catch (commitError) {
              console.error('Error committing code:', commitError);
            }
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error in ai-chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
