/// <reference path="../deno.d.ts" />

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- STATIC TEMPLATES ---
// flexible helper to avoid AI needing to generate boilerplate
const BASE_FILES = {
  'vite.config.ts': `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));`,
  'tsconfig.json': `{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}`,
  'tsconfig.app.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}`,
  'tsconfig.node.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}`,
  'tailwind.config.ts': `import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;`,
  'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
  '.gitignore': `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.env
`
};

// Website type detection
function detectWebsiteType(message: string): {
  type: 'landing' | 'ecommerce' | 'blog' | 'portfolio' | 'saas' | 'restaurant' | 'custom';
  style: 'modern' | 'minimal' | 'corporate' | 'creative';
  features: string[];
} {
  const msg = message.toLowerCase();

  let type: 'landing' | 'ecommerce' | 'blog' | 'portfolio' | 'saas' | 'restaurant' | 'custom' = 'landing';
  if (msg.includes('shop') || msg.includes('store') || msg.includes('ecommerce') || msg.includes('product')) {
    type = 'ecommerce';
  } else if (msg.includes('blog') || msg.includes('post') || msg.includes('article')) {
    type = 'blog';
  } else if (msg.includes('portfolio') || msg.includes('project') || msg.includes('showcase')) {
    type = 'portfolio';
  } else if (msg.includes('saas') || msg.includes('software') || msg.includes('app')) {
    type = 'saas';
  } else if (msg.includes('restaurant') || msg.includes('menu') || msg.includes('food')) {
    type = 'restaurant';
  }

  let style: 'modern' | 'minimal' | 'corporate' | 'creative' = 'modern';
  if (msg.includes('minimal') || msg.includes('clean')) style = 'minimal';
  if (msg.includes('corporate') || msg.includes('business')) style = 'corporate';
  if (msg.includes('creative') || msg.includes('art')) style = 'creative';

  const features: string[] = [];
  if (msg.includes('pricing') || msg.includes('price')) features.push('pricing');
  if (msg.includes('contact') || msg.includes('form')) features.push('contact');
  if (msg.includes('testimonial') || msg.includes('review')) features.push('testimonials');
  if (msg.includes('about')) features.push('about');
  if (msg.includes('team')) features.push('team');

  return { type, style, features };
}

// Generate repository name from user message
function generateRepoName(message: string, userEmail: string): string {
  const msg = message.toLowerCase();

  // Extract potential name
  const nameMatch = msg.match(/(?:for|named|called)\s+([a-z0-9-]+)/i);
  if (nameMatch) {
    return nameMatch[1].toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }

  // Generate from type
  const { type } = detectWebsiteType(message);
  const baseName = `${type}-website`;

  // Add timestamp for uniqueness
  const timestamp = Date.now().toString().slice(-6);
  return `${baseName}-${timestamp}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { prompt, repoName: providedRepoName, websiteType, companyName } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    const GITHUB_TOKEN = Deno.env.get('GITHUB_ACCESS_TOKEN');

    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN is not configured');
    }

    // Detect website type and generate repo name
    const detected = detectWebsiteType(prompt);
    const repoName = providedRepoName || generateRepoName(prompt, user.email || 'user');

    // Step 1: Create GitHub repository
    console.log(`Creating repository: ${repoName}`);
    let createRepoResponse: Response;
    try {
      createRepoResponse = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: repoName,
          description: `AI-generated ${detected.type} website`,
          private: false,
          auto_init: false,
        }),
      });

      if (!createRepoResponse.ok) {
        const errorData = await createRepoResponse.json().catch(async () => ({ message: await createRepoResponse.text() }));

        if (createRepoResponse.status === 422 && errorData.errors?.some((e: any) => e.field === 'name')) {
          throw new Error(`Repository name "${repoName}" is invalid or already exists. Please choose a different name.`);
        } else if (createRepoResponse.status === 401) {
          throw new Error('GitHub authentication failed. Please check your GitHub token.');
        } else if (createRepoResponse.status === 403) {
          throw new Error('GitHub API rate limit exceeded or permission denied.');
        } else {
          throw new Error(`Failed to create repository: ${errorData.message || errorData.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create repository. Please try again.');
    }

    const repoData = await createRepoResponse.json();
    const repoOwner = repoData.owner.login;

    // Step 2: Generate website files using AI
    console.log('Generating website files...');

    // Construct the prompt
    // We implicitly provide the config files, so the AI knows the environment
    const systemPrompt = `You are an expert web developer creating a production-ready React + TypeScript + Tailwind CSS website.
    
Your task: Generate the unique source code for a ${detected.type} website based on this request: "${prompt}"

Context:
- The project is already configured with Vite, TypeScript, and Tailwind CSS.
- The following config files are ALREADY created (DO NOT generate them): vite.config.ts, tsconfig.json, tailwind.config.ts, etc.
- You must use Lucide React icons.
- You must use Tailwind CSS for styling.
- You should create a modern, responsive design with style: ${detected.style}.
- Company Name: ${companyName || 'My Company'}

REQUIRED FILES TO GENERATE:
1. \`package.json\` (Include standard React/Vite deps + any specific libs you need like framer-motion, lucide-react)
2. \`index.html\` (The entry HTML file)
3. \`src/main.tsx\` (The React entry point)
4. \`src/App.tsx\` (The main App component/router)
5. \`src/index.css\` (Global CSS imports for Tailwind)
6. \`src/components/Navigation.tsx\` (Responsive navbar)
7. \`src/components/Footer.tsx\` (Footer component)
8. At least 2-3 other key components specific to the ${detected.type} type (e.g., Hero, Features, ProductCard).

OUTPUT FORMAT:
You must provide the code for each file wrapped in an XML-like tag:
<file path="path/to/file">
... code content ...
</file>

Example:
<file path="src/main.tsx">
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
</file>

IMPORTANT:
- Do not use markdown code blocks (\`\`\`). Use the <file> tags.
- Provide FULL content for every file. No placeholders.
- Ensure all imports match the file structure you create.`;

    const models = [
      'deepseek/deepseek-r1-0528',
      'deepseek/deepseek-r1',
      'google/gemini-pro',
      'mistralai/mistral-large'
    ];

    let aiResponse;
    let currentModelIndex = 0;

    while (currentModelIndex < models.length) {
      const currentModel = models[currentModelIndex];
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://empirialdesigns.co.za',
            'X-Title': 'Empirial Designs',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: currentModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7, // Slightly creative but structured
          }),
        });

        if (response.ok) {
          const data = await response.json();
          aiResponse = data.choices[0]?.message?.content || '';
          break;
        }
        currentModelIndex++;
      } catch (error) {
        currentModelIndex++;
        continue;
      }
    }

    if (!aiResponse) {
      throw new Error('Failed to generate website code. All AI models are currently unavailable.');
    }

    // Step 3: Parse AI response
    // Logic: Look for <file path="..."> content </file>
    const fileRegex = /<file\s+path="([^"]+)">([\s\S]*?)<\/file>/g;
    const files: Array<{ path: string; content: string }> = [];

    // Add base templates first
    for (const [path, content] of Object.entries(BASE_FILES)) {
      files.push({ path, content });
    }

    let match;
    while ((match = fileRegex.exec(aiResponse)) !== null) {
      const path = match[1].trim();
      const content = match[2].trim();
      if (path && content) {
        files.push({ path, content });
      }
    }

    if (files.length <= Object.keys(BASE_FILES).length) {
      console.error('AI response:', aiResponse.substring(0, 500));
      // Fallback: Try previous regex if XML parsing fails (backward compatibility if model ignores instructions)
      const fallbackRegex = /```(\w+)?\s*(?:path|file|filename)=([^\n]+)\n([\s\S]*?)```/g;
      while ((match = fallbackRegex.exec(aiResponse)) !== null) {
        const path = match[2].trim();
        const content = match[3].trim();
        if (path && content) {
          files.push({ path, content });
        }
      }
    }

    if (files.length <= Object.keys(BASE_FILES).length) {
      throw new Error('AI generated no valid files. Please try again with a different prompt.');
    }

    console.log(`Extracted ${files.length} files to commit`);

    // Step 4: Commit files to repository using GitHub API
    const defaultBranch = repoData.default_branch || 'main';

    // Create blobs for each file
    const blobs = [];
    const blobErrors: string[] = [];

    for (const file of files) {
      try {
        if (!file.content || file.content.trim().length === 0) continue;

        const blobResponse = await fetch(
          `https://api.github.com/repos/${repoOwner}/${repoName}/git/blobs`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: btoa(file.content),
              encoding: 'base64',
            }),
          }
        );

        if (!blobResponse.ok) {
          const errorText = await blobResponse.text();
          blobErrors.push(`${file.path}: ${errorText}`);
          console.error(`Failed to create blob for ${file.path}:`, errorText);
          continue;
        }

        const blob = await blobResponse.json();
        blobs.push({ path: file.path, sha: blob.sha, mode: '100644', type: 'blob' });
      } catch (error) {
        blobErrors.push(`${file.path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(`Error creating blob for ${file.path}:`, error);
      }
    }

    if (blobs.length === 0) {
      throw new Error(`Failed to create file blobs. ${blobErrors.join('; ')}`);
    }

    // Create tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base_tree: null,
          tree: blobs,
        }),
      }
    );

    if (!treeResponse.ok) {
      throw new Error('Failed to create file tree');
    }

    const tree = await treeResponse.json();

    // Create commit
    const commitResponse = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/commits`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Initial commit: AI-generated website',
          tree: tree.sha,
          parents: [],
        }),
      }
    );

    if (!commitResponse.ok) {
      throw new Error('Failed to create commit');
    }

    const commit = await commitResponse.json();

    // Update branch ref
    await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${defaultBranch}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sha: commit.sha,
          force: true,
        }),
      }
    );

    // Step 6: Store in database
    const structure = files.map(f => ({
      type: 'file',
      path: f.path,
      name: f.path.split('/').pop() || f.path,
    }));

    const { data: repoRecord, error: dbError } = await supabaseClient
      .from('user_repos')
      .insert({
        user_id: user.id,
        repo_url: repoData.html_url,
        repo_owner: repoOwner,
        repo_name: repoName,
        repo_structure: structure,
        template_type: detected.type,
        generation_prompt: prompt,
      })
      .select()
      .single();

    return new Response(JSON.stringify({
      success: true,
      repo: {
        id: repoRecord?.id || null,
        name: repoName,
        owner: repoOwner,
        url: repoData.html_url,
        files_created: files.length,
        commit_url: commit.html_url,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in create-website:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
