const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const fetch = require("node-fetch");

admin.initializeApp();
const db = admin.firestore();

// --- STATIC TEMPLATES ---
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
};`,
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

// Website type detection helper
function detectWebsiteType(message) {
  const msg = message.toLowerCase();

  let type = 'landing';
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

  let style = 'modern';
  if (msg.includes('minimal') || msg.includes('clean')) style = 'minimal';
  if (msg.includes('corporate') || msg.includes('business')) style = 'corporate';
  if (msg.includes('creative') || msg.includes('art')) style = 'creative';

  const features = [];
  if (msg.includes('pricing') || msg.includes('price')) features.push('pricing');
  if (msg.includes('contact') || msg.includes('form')) features.push('contact');
  if (msg.includes('testimonial') || msg.includes('review')) features.push('testimonials');
  if (msg.includes('about')) features.push('about');
  if (msg.includes('team')) features.push('team');

  return { type, style, features };
}

// Generate repository name helper
function generateRepoName(message, userEmail) {
  const msg = message.toLowerCase();
  const nameMatch = msg.match(/(?:for|named|called)\s+([a-z0-9-]+)/i);
  if (nameMatch) {
    return nameMatch[1].toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }
  const { type } = detectWebsiteType(message);
  const baseName = `${type}-website`;
  const timestamp = Date.now().toString().slice(-6);
  return `${baseName}-${timestamp}`;
}

// Cloud Function: createWebsite
exports.createWebsite = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // 1. Validate Auth (Bearer Token)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    // 2. Parse Request
    const { prompt, repoName: providedRepoName, companyName } = req.body;

    // 3. Environment Variables
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    if (!OPENROUTER_API_KEY || !GITHUB_TOKEN) {
      return res.status(500).json({ error: 'Server configuration error: Missing API Keys' });
    }

    try {
      const detected = detectWebsiteType(prompt);
      const repoName = providedRepoName || generateRepoName(prompt, userEmail);

      // Step 4: Create GitHub Repo
      console.log(`Creating repository: ${repoName}`);
      let createRepoResponse = await fetch('https://api.github.com/user/repos', {
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
        // Handle existing repo name case gracefully
        if (createRepoResponse.status === 422) {
          return res.status(400).json({ error: `Repository "${repoName}" already exists.` });
        }
        const errorData = await createRepoResponse.text();
        return res.status(500).json({ error: `Failed to create repository: ${errorData}` });
      }

      const repoData = await createRepoResponse.json();
      const repoOwner = repoData.owner.login;

      // Step 5: Generate Code with AI
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
      </file>`;

      const aiResponseRaw = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://empirialdesigns.co.za',
          'X-Title': 'Empirial Designs',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1', // Or preferred model
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!aiResponseRaw.ok) {
        throw new Error('AI generation failed');
      }
      const aiData = await aiResponseRaw.json();
      const aiContent = aiData.choices[0]?.message?.content || '';

      // Step 6: Parse Files
      const files = [];
      const fileRegex = /<file\s+path="([^"]+)">([\s\S]*?)<\/file>/g;

      // Add base templates
      for (const [path, content] of Object.entries(BASE_FILES)) {
        files.push({ path, content });
      }

      let match;
      while ((match = fileRegex.exec(aiContent)) !== null) {
        const path = match[1].trim();
        const content = match[2].trim();
        if (path && content) {
          files.push({ path, content });
        }
      }

      // Step 7: Commit to GitHub
      const blobs = [];
      for (const file of files) {
        const blobResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/git/blobs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: Buffer.from(file.content).toString('base64'),
            encoding: 'base64',
          }),
        });
        const blob = await blobResponse.json();
        blobs.push({ path: file.path, sha: blob.sha, mode: '100644', type: 'blob' });
      }

      const treeResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/git/trees`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base_tree: null, tree: blobs }),
      });
      const tree = await treeResponse.json();

      const commitResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/git/commits`, {
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
      });
      const commit = await commitResponse.json();

      await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/main`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sha: commit.sha, force: true }),
      });

      // Step 8: Save to Firestore
      const repoId = `${userId}_${repoName}`;
      await db.collection('user_repos').doc(repoId).set({
        user_id: userId,
        repo_owner: repoOwner,
        repo_name: repoName,
        repo_url: repoData.html_url,
        deploy_url: `https://${repoName}.netlify.app`, // Assumption for now
        created_at: new Date().toISOString(),
        template_type: detected.type,
        generation_prompt: prompt,
      });

      return res.status(200).json({
        success: true,
        repo: {
          name: repoName,
          url: repoData.html_url,
          files_created: files.length,
        }
      });

    } catch (error) {
      console.error('Error in createWebsite:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});

// Cloud Function: getRepoContents
exports.getRepoContents = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Verify token
      const token = authHeader.split('Bearer ')[1];
      await admin.auth().verifyIdToken(token);

      const { owner, repo, path: filePath } = req.body;
      const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

      if (!GITHUB_TOKEN) {
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath || ''}`;
      const githubRes = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!githubRes.ok) {
        throw new Error('Failed to fetch from GitHub');
      }

      const data = await githubRes.json();
      return res.status(200).json(data);

    } catch (error) {
      console.error('Error in getRepoContents:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});

// Cloud Function: aiChat
exports.aiChat = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const token = authHeader.split('Bearer ')[1];
      await admin.auth().verifyIdToken(token);

      const { messages, repoOwner, repoName, selectedFiles } = req.body;
      const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

      if (!OPENROUTER_API_KEY) return res.status(500).json({ error: 'Missing API Key' });

      // Construct System Prompt with Context
      let systemContext = `You are an expert web developer helping a user modify a React+Vite website.
            Repo: ${repoOwner}/${repoName}.
            
            Instrustions:
            1. You can modify files by outputting the file content wrapped in <file path="...">...</file> tags.
            2. If the user asks a question, just answer it.
            3. If the user asks for a change, provide the FULL modified file content.
            `;

      if (selectedFiles && selectedFiles.length > 0) {
        // In a real app, we would fetch the content of these files here to provide context
        systemContext += `\n\nUser is focusing on: ${selectedFiles.join(', ')}.`;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://empirialdesigns.co.za',
          'X-Title': 'Empirial Designs',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1',
          messages: [
            { role: 'system', content: systemContext },
            ...messages
          ],
          stream: true
        }),
      });

      // Proxy the stream back to the client
      response.body.pipe(res);

    } catch (error) {
      console.error('Error in aiChat:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});

// Cloud Function: getRepoTree (for Sandpack)
exports.getRepoTree = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const token = authHeader.split('Bearer ')[1];
      await admin.auth().verifyIdToken(token);

      const { owner, repo } = req.body;
      const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

      if (!GITHUB_TOKEN) return res.status(500).json({ error: 'Missing API Key' });

      // 1. Get default branch (usually main)
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
      });
      if (!repoRes.ok) throw new Error('Failed to fetch repo info');
      const repoData = await repoRes.json();
      const defaultBranch = repoData.default_branch || 'main';

      // 2. Get the recursive tree
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, {
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
      });
      if (!treeRes.ok) throw new Error('Failed to fetch git tree');
      const treeData = await treeRes.json();

      if (!treeData.tree) {
        return res.status(500).json({ error: 'Failed to fetch tree structure' });
      }

      // 3. Filter for blobs (files) and fetch content
      const blobs = treeData.tree.filter(node => node.type === 'blob');

      // Limit to specific extensions and reasonable count
      const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json', '.md'];
      const fileBlobs = blobs.filter(blob => {
        return textExtensions.some(ext => blob.path.endsWith(ext)) &&
          !blob.path.includes('package-lock.json') &&
          !blob.path.includes('yarn.lock') &&
          !blob.path.includes('dist/');
      }).slice(0, 50);

      const files = {};

      // Parallel fetch for speed
      await Promise.all(fileBlobs.map(async (blob) => {
        try {
          const contentRes = await fetch(blob.url, {
            headers: {
              'Authorization': `Bearer ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3.raw'
            }
          });
          if (contentRes.ok) {
            const text = await contentRes.text();
            // Store with leading slash for Sandpack if needed, usually just path is fine
            // Sandpack expects paths like "/src/App.js"
            const path = blob.path.startsWith('/') ? blob.path : '/' + blob.path;
            files[path] = { code: text };
          }
        } catch (e) {
          console.error(`Failed to fetch ${blob.path}`, e);
        }
      }));

      // Static mocks for package.json if missing (fixes "module not found" in Sandpack defaults)
      if (!files['/package.json']) {
        files['/package.json'] = {
          code: JSON.stringify({
            name: "generated-project",
            main: "/index.html",
            dependencies: { "react": "^18.0.0", "react-dom": "^18.0.0", "lucide-react": "latest", "clsx": "latest", "tailwind-merge": "latest" },
            devDependencies: { "vite": "latest" }
          }, null, 2)
        };
      }

      return res.status(200).json({ files });

    } catch (error) {
      console.error('Error in getRepoTree:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});
