import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import OpenAI from 'openai';
import Groq from 'groq-sdk';

// Determine the directory and file path for the .env file safely
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the server's own directory
const envPath = path.join(__dirname, '.env');
const result = dotenv.config({ path: envPath });

console.log(`\n--- Backend Startup Diagnostics ---`);
console.log(`📂 Loading .env from: ${envPath}`);
if (result.error) {
    console.error(`❌ Failed to load .env file:`, result.error.message);
} else {
    console.log(`✅ .env file loaded successfully.`);
}

const apiKey      = process.env.GEMINI_API_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const llmProvider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();

console.log(`🔑 GEMINI_API_KEY: ${apiKey ? `Found (Starts with ${apiKey.substring(0, 7)}...)` : 'NOT FOUND'}`);
console.log(`🔑 GITHUB_TOKEN: ${githubToken ? 'Found' : 'NOT FOUND'}`);
console.log(`🤖 LLM Provider: ${llmProvider}`);
if (llmProvider === 'openrouter' || llmProvider === 'groq') {
    const orKey = process.env.OPENROUTER_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    console.log(`🔑 OPENROUTER_API_KEY: ${orKey ? 'Found' : 'NOT FOUND'}`);
    console.log(`🔑 GROQ_API_KEY: ${groqKey ? 'Found' : 'NOT FOUND'}`);
    console.log(`🧠 Primary Model: ${process.env.GROQ_MODEL_PRIMARY || process.env.OPENROUTER_MODEL || '(not set)'}`);
}
console.log(`-----------------------------------\n`);

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── LLM Client ──────────────────────────────────────────────────────────────

// Gemini (LangChain) — ALWAYS initialized when API key exists.
// Acts as primary when LLM_PROVIDER=gemini, and as a universal fallback
// when any OpenRouter model fails (rate limit, timeout, etc.).
const geminiModel = process.env.GEMINI_API_KEY ? new ChatGoogleGenerativeAI({
    model:            'gemini-2.5-flash',
    apiKey:           process.env.GEMINI_API_KEY,
    maxOutputTokens:  4096,
}) : null;

// ─── 5-Stage Robust Model Chain ──────────────────────────────────────────────
// 1. ⚡ Groq Llama 4 Scout (Ultra Fast)
// 2. ⚡ Groq Compound     (High Quality)
// 3. 🤖 Nemotron 30B      (OpenRouter Primary)
// 4. 🔄 Gemma 3 27B       (OpenRouter Backup)
// 5. 🛡️ Gemini 2.5 Flash  (Direct API Final Fallback)

const groqClient = process.env.GROQ_API_KEY ? new Groq({
    apiKey: process.env.GROQ_API_KEY,
}) : null;

const PRIMARY_OR_CLIENT = process.env.OPENROUTER_API_KEY ? new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey:  process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title':      'Antigravity Companion',
    },
}) : null;

const BACKUP_OR_CLIENT = process.env.OR_KEY_GEMMA ? new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey:  process.env.OR_KEY_GEMMA,
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title':      'Antigravity Companion',
    },
}) : null;

const MODELS = {
    groq1: process.env.GROQ_MODEL_PRIMARY || 'meta-llama/llama-4-scout-17b-16e-instruct',
    groq2: process.env.GROQ_MODEL_BACKUP  || 'groq/compound',
    or1:   process.env.OPENROUTER_MODEL    || 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    or2:   process.env.OR_MODEL_GEMMA      || 'google/gemma-3-27b-it:free',
};

if (llmProvider !== 'gemini' && geminiModel) {
    console.log('🛡️  Multi-stage fallback active. Final destination: Gemini 2.5 Flash.');
}

// ─── Smart Model Routing ──────────────────────────────────────────────────

function getORClient(modelName) {
    return (modelName === OR_BACKUP_MODEL && BACKUP_OR_CLIENT) ? BACKUP_OR_CLIENT : PRIMARY_OR_CLIENT;
}

if (llmProvider !== 'gemini' && geminiModel) {
    console.log('🛡️  Multi-stage fallback active. Final destination: Gemini 2.5 Flash.');
    console.log(`🤖 Primary  : ${MODELS.groq1}`);
    console.log(`🔄 Backup 1 : ${MODELS.groq2}`);
} else if (llmProvider !== 'gemini' && !geminiModel) {
    console.warn('⚠️  No GEMINI_API_KEY — fallback unavailable.');
}

// All routes use the same primary model
const PRIMARY_MODEL = MODELS.groq1;


/**
 * Generate a full response — 5-stage robust fallback chain
 */
async function llmGenerate(prompt, { type = 'explanation', json = false } = {}) {
    // SPECIAL ROUTING: Architecture goes straight to Gemini for maximum diagram quality
    if (type === 'architecture' && geminiModel) {
        console.log('🏛️  [Architecture] Routing directly to Gemini 2.5 Flash for high-quality DFD...');
        return geminiModel.pipe(new StringOutputParser()).invoke(prompt);
    }

    // 1. Groq - Llama 4 Scout (Primary)
    if (groqClient) {
        try {
            console.log(`⚡ [Stage 1] Groq Primary → ${MODELS.groq1}`);
            const completion = await groqClient.chat.completions.create({
                model: MODELS.groq1,
                messages: [{ role: 'user', content: prompt }],
                ...(json ? { response_format: { type: 'json_object' } } : {}),
            });
            return completion.choices[0]?.message?.content ?? '';
        } catch (e) {
            console.warn(`⚠️ [Stage 1] Failed: ${e.message.split('\n')[0]}`);
        }

        // 2. Groq - Compound (Backup)
        try {
            console.log(`⚡ [Stage 2] Groq Backup → ${MODELS.groq2}`);
            const completion = await groqClient.chat.completions.create({
                model: MODELS.groq2,
                messages: [{ role: 'user', content: prompt }],
                ...(json ? { response_format: { type: 'json_object' } } : {}),
            });
            return completion.choices[0]?.message?.content ?? '';
        } catch (e) {
            console.warn(`⚠️ [Stage 2] Failed: ${e.message.split('\n')[0]}`);
        }
    }

    // 3. OpenRouter - Nemotron (Backup)
    if (PRIMARY_OR_CLIENT) {
        try {
            console.log(`🤖 [Stage 3] OR Primary → ${MODELS.or1}`);
            const completion = await PRIMARY_OR_CLIENT.chat.completions.create({
                model: MODELS.or1,
                messages: [{ role: 'user', content: prompt }],
                ...(json ? { response_format: { type: 'json_object' } } : {}),
            });
            return completion.choices[0]?.message?.content ?? '';
        } catch (e) {
            console.warn(`⚠️ [Stage 3] Failed: ${e.message.split('\n')[0]}`);
        }
    }

    // 4. OpenRouter - Gemma (Backup)
    if (BACKUP_OR_CLIENT) {
        try {
            console.log(`🔄 [Stage 4] OR Backup → ${MODELS.or2}`);
            const completion = await BACKUP_OR_CLIENT.chat.completions.create({
                model: MODELS.or2,
                messages: [{ role: 'user', content: prompt }],
                ...(json ? { response_format: { type: 'json_object' } } : {}),
            });
            return completion.choices[0]?.message?.content ?? '';
        } catch (e) {
            console.warn(`⚠️ [Stage 4] Failed: ${e.message.split('\n')[0]}`);
        }
    }

    // 5. Final Fallback - Gemini 2.5 Flash
    if (!geminiModel) throw new Error('All model stages failed and Gemini is unavailable.');
    console.log('🛡️  [Stage 5] Final Fallback → Gemini 2.5 Flash');
    return geminiModel.pipe(new StringOutputParser()).invoke(prompt);
}

/**
 * Stream a response — 5-stage robust fallback chain
 */
async function llmStream(prompt, res, { type = 'explanation', sseType = null } = {}) {
    const formatChunk = (chunk) => {
        const obj = sseType ? { type: sseType, chunk } : { chunk };
        return `data: ${JSON.stringify(obj)}\n\n`;
    };

    const runStream = async (client, model, label) => {
        console.log(`📡 [Streaming] ${label} → ${model}`);
        const stream = await client.chat.completions.create({
            model, messages: [{ role: 'user', content: prompt }], stream: true,
        });
        for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) res.write(formatChunk(text));
        }
    };

    const streamGemini = async () => {
        if (!geminiModel) throw new Error('Gemini fallback unavailable.');
        console.log(sseType === 'architecture' ? '🏛️  [Architecture] Streaming via Gemini 2.5 Flash...' : '🛡️  [Stage 5] Final Fallback → Gemini 2.5 Flash');
        const stream = await geminiModel.pipe(new StringOutputParser()).stream(prompt);
        for await (const chunk of stream) res.write(formatChunk(chunk));
    };

    try {
        // SPECIAL ROUTING: Architecture goes straight to Gemini
        if (type === 'architecture' && geminiModel) {
            await streamGemini();
            res.write('data: [DONE]\n\n');
            return;
        }

        // Stage 1: Groq Primary
        try {
            if (!groqClient) throw new Error('No Groq Client');
            await runStream(groqClient, MODELS.groq1, 'Stage 1 (Groq)');
        } catch (e1) {
            console.warn(`⚠️ [Stage 1] Failed: ${e1.message.split('\n')[0]}`);
            // Stage 2: Groq Backup
            try {
                if (!groqClient) throw new Error('No Groq Client');
                await runStream(groqClient, MODELS.groq2, 'Stage 2 (Groq)');
            } catch (e2) {
                console.warn(`⚠️ [Stage 2] Failed: ${e2.message.split('\n')[0]}`);
                // Stage 3: OR Primary
                try {
                    if (!PRIMARY_OR_CLIENT) throw new Error('No OR Client');
                    await runStream(PRIMARY_OR_CLIENT, MODELS.or1, 'Stage 3 (OR)');
                } catch (e3) {
                    console.warn(`⚠️ [Stage 3] Failed: ${e3.message.split('\n')[0]}`);
                    // Stage 4: OR Backup
                    try {
                        if (!BACKUP_OR_CLIENT) throw new Error('No Backup Client');
                        await runStream(BACKUP_OR_CLIENT, MODELS.or2, 'Stage 4 (OR)');
                    } catch (e4) {
                        console.warn(`⚠️ [Stage 4] Failed: ${e4.message.split('\n')[0]}`);
                        // Stage 5: Gemini
                        await streamGemini();
                    }
                }
            }
        }
        res.write('data: [DONE]\n\n');
    } catch (error) {
        console.error('Final Stream Error:', error);
        res.write(formatChunk(`Error: All model stages failed. ${error.message}`));
        res.write('data: [DONE]\n\n');
    }
}

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ────────────────────────────────────────────────────────────────────
// Allow the frontend origin (set CORS_ORIGIN env var in production).
// Falls back to permitting all *.vercel.app preview URLs during development.
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true);
        // Explicit allow-list from env
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        // Allow all *.vercel.app subdomains (covers preview deployments)
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        // Allow localhost for local dev
        if (origin.startsWith('http://localhost')) return callback(null, true);
        console.warn(`CORS blocked: ${origin}`);
        return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight OPTIONS requests for all routes
app.options('/*splat', cors());

app.use(express.json({ limit: '5mb' }));

// --- Gemini AI Route (Standard) ---
app.post('/api/gemini/generate', async (req, res) => {
    try {
        const { prompt, isJson, type } = req.body;

        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        // llmGenerate() routes to OpenRouter or Gemini based on LLM_PROVIDER
        const result = await llmGenerate(prompt, { json: isJson, type: type || 'explanation' });
        res.json({ result });

    } catch (error) {
        console.error(`Error calling LLM (${llmProvider}):`, error);
        res.status(500).json({ error: `Failed to generate content from AI. Details: ${error.message}`, details: error.message });
    }
});

// --- AI Route (Streaming) — OpenRouter or Gemini based on LLM_PROVIDER ---
app.post('/api/gemini/stream', async (req, res) => {
    try {
        const { prompt, type } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // llmStream() routes to OpenRouter or Gemini then writes SSE chunks
        await llmStream(prompt, res, { type: type || 'explanation' });
        res.end();
    } catch (error) {
        console.error('Stream Error:', error);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

// --- GitHub Routes ---
// Proxies GitHub requests to avoid exposing frontend code to CORS complexity or token theft

app.post('/api/github/tree', async (req, res) => {
    try {
        const { owner, repo } = req.body;
        if (!owner || !repo) {
            return res.status(400).json({ error: 'Missing owner or repo' });
        }

        // Use backend token if available to avoid rate limits
        const token = process.env.GITHUB_TOKEN;
        const headers = token ? { 'Authorization': `token ${token}` } : {};

        // 1. Get default branch
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        if (!repoResponse.ok) throw new Error(`Repository not found (${repoResponse.status})`);
        
        const repoData = await repoResponse.json();
        const defaultBranch = repoData.default_branch;

        // 2. Get full file tree
        const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
        if (!treeResponse.ok) throw new Error(`Failed to fetch repository tree (${treeResponse.status})`);
        
        const treeData = await treeResponse.json();

        // Filter out large binaries or unnecessary files if you want to save bandwidth on the backend
        const filesOnly = treeData.tree.filter(item => item.type === 'blob');
        
        res.json({ files: filesOnly });
    } catch (error) {
        console.error('GitHub fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/github/file', async (req, res) => {
    try {
        const { owner, repo, path } = req.body;
        if (!owner || !repo || !path) {
            return res.status(400).json({ error: 'Missing owner, repo, or path' });
        }

        const token = process.env.GITHUB_TOKEN;
        const headers = token ? { 'Authorization': `token ${token}` } : {};

        // Fetch raw content
        const contentResponse = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}`, { headers });
        
        // Fallback or specific branch handling could be added here
        
        if (!contentResponse.ok) throw new Error(`Failed to fetch file content (${contentResponse.status})`);
        
        const content = await contentResponse.text();
        res.send(content); // Send plain text
    } catch (error) {
        console.error('GitHub file fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});

import { ragEngine } from './ragEngine.js';

// ... (previous server setup)

// --- RAG Routes ---

app.post('/api/rag/index', async (req, res) => {
    try {
        const { owner, repo } = req.body;
        if (!owner || !repo) return res.status(400).json({ error: 'Missing owner or repo' });

        const token = process.env.GITHUB_TOKEN;
        const wasCached = ragEngine.hasIndex(`${owner}/${repo}`);
        await ragEngine.fetchAndIndex(owner, repo, token);

        const stats = ragEngine.indexStats(`${owner}/${repo}`);
        res.json({
            message: wasCached ? 'Already indexed (loaded from cache)' : 'Indexing complete',
            repo: `${owner}/${repo}`,
            stats,
        });
    } catch (error) {
        console.error('RAG Indexing Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- RAG: Index Stats ---
app.get('/api/rag/stats', (req, res) => {
    const { owner, repo } = req.query;
    if (!owner || !repo) return res.status(400).json({ error: 'Missing owner or repo' });
    const stats = ragEngine.indexStats(`${owner}/${repo}`);
    if (!stats) return res.status(404).json({ error: 'Not indexed yet' });
    res.json(stats);
});

// --- RAG: Clear Index ---
app.delete('/api/rag/index', (req, res) => {
    const { owner, repo } = req.query;
    if (!owner || !repo) return res.status(400).json({ error: 'Missing owner or repo' });
    ragEngine.clearIndex(`${owner}/${repo}`);
    res.json({ message: 'Index cleared', repo: `${owner}/${repo}` });
});

app.post('/api/rag/query', async (req, res) => {
    try {
        const { owner, repo, query, language } = req.body;
        if (!owner || !repo || !query) return res.status(400).json({ error: 'Missing owner, repo, or query' });

        const repoKey = `${owner}/${repo}`;

        // ✅ k=10 (was 5) + optional language filter
        const filter = language ? { language } : null;
        const contextDocs = await ragEngine.search(repoKey, query, 10, filter);

        const contextText = contextDocs
            .map(doc => `📄 File: ${doc.metadata.path} (${doc.metadata.language || 'unknown'})\n\`\`\`\n${doc.pageContent}\n\`\`\``)
            .join('\n\n---\n\n');

        const prompt = `You are an expert code analyst. Answer the question based ONLY on the provided code context from the repository: ${repoKey}.

Context:
${contextText}

Question: ${query}

Answer professionally and include code snippets if relevant. Always reference the specific file name when citing code.`;

        const result = await llmGenerate(prompt, { type: 'workspace' });

        res.json({
            result,
            sources: [...new Set(contextDocs.map(d => d.metadata.path))],
            chunksUsed: contextDocs.length,
        });
    } catch (error) {
        console.error('RAG Query Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/rag/dfd', async (req, res) => {
    try {
        const { owner, repo, fileTree } = req.body;

        // owner/repo are optional — we can generate from file tree alone
        const repoKey = owner && repo ? `${owner}/${repo}` : null;

        let contextText = '';
        if (repoKey && ragEngine.hasIndex(repoKey)) {
            // Fetch relevant context about architecture and data flow
            const contextDocs = await ragEngine.search(
                repoKey,
                'system architecture, core modules, data flow, processes, system interactions, main entry points',
                15
            );
            contextText = contextDocs
                .map(doc => `📄 File: ${doc.metadata.path} (${doc.metadata.language || 'unknown'})\n\`\`\`\n${doc.pageContent}\n\`\`\``)
                .join('\n\n---\n\n');
        }

        const hasContext = fileTree || contextText;
        if (!hasContext) {
            return res.status(400).json({ error: 'No project data available. Please load a repository first.' });
        }

        const prompt = `You are an expert software architect.
Generate a comprehensive Architecture Diagram and Data Flow Diagram (DFD) for the entire project.

**Formatting Rules (MUST follow):**
- Start with a clear 🎯 **Architecture Overview** (1-2 sentences).
- Provide an **Interactive D3.js Diagram** wrapped in a \`\`\`json code block. 
  The JSON structure MUST follow this format:
  {
    "type": "d3-force",
    "nodes": [{"id": "main.js", "name": "Entry Point", "type": "module"}, ...],
    "links": [{"source": "main.js", "target": "App.js"}, ...]
  }
- Provide **multiple** Mermaid.js diagrams wrapped in \`\`\`mermaid ... \`\`\` code blocks:
  1. A **High-Level System Architecture** (flowchart TD).
  2. A **Detailed Data Flow Diagram (DFD)** (flowchart LR).
- CRITICAL MERMAID SYNTAX: Enclose all node labels in double quotes.
- Minimize text theory; focus on the visual logic.
- Add a tiny section 🛠️ **Tech Stack** at the very end.

${fileTree ? `File Tree:\n\`\`\`json\n${fileTree}\n\`\`\`\n\n` : ''}
${contextText ? `Code Context:\n${contextText}\n\n` : ''}
Generate the architecture visualization now.`;

        const result = await llmGenerate(prompt, { type: 'architecture' });
        if (!result) throw new Error('LLM returned empty response');
        res.json({ result });
    } catch (error) {
        console.error('RAG DFD Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Production Incident Debugger Route ---

app.post('/api/rag/analyze-error', async (req, res) => {
    try {
        const { owner, repo, stackTrace } = req.body;
        if (!owner || !repo || !stackTrace) {
            return res.status(400).json({ error: 'Missing owner, repo, or stackTrace' });
        }

        const repoKey = `${owner}/${repo}`;

        // --- Step 1: Parse stack trace for meaningful search terms ---
        const lines = stackTrace.split('\n').map(l => l.trim()).filter(Boolean);

        // Extract error type + message (first line)
        const errorSummary = lines[0] || stackTrace.slice(0, 200);

        // Extract file names and function names from stack frames
        // Matches: "at FuncName (file.js:10:5)" or "at file.js:10:5"
        const frameRegex = /at\s+(?:([^\s(]+)\s+\()?([^)]+\.(?:js|jsx|ts|tsx|py|mjs|cjs))(?::(\d+))?/gi;
        const mentions = new Set();
        let match;
        while ((match = frameRegex.exec(stackTrace)) !== null) {
            if (match[1]) mentions.add(match[1].replace(/^new /, '')); // function/class name
            if (match[2]) {
                // just the filename, not full path
                const fname = match[2].split('/').pop().split('\\').pop().split(':')[0];
                if (fname) mentions.add(fname);
            }
        }

        // Also grab capitalised words from error message (likely class/component names)
        const errorWords = errorSummary.match(/\b[A-Z][a-zA-Z0-9]+/g) || [];
        errorWords.forEach(w => mentions.add(w));

        // Build a composite search query: error type + key identifiers
        const searchQuery = [errorSummary, ...mentions].join(' ').slice(0, 500);
        console.log(`🔍 Incident search query: "${searchQuery.slice(0, 120)}..."`);

        // --- Step 2: Search RAG index (if indexed) ---
        let contextText = '';
        let sources = [];

        if (ragEngine.hasIndex(repoKey)) {
            // ✅ k=15 (was 6) — fetch more candidates, reranking picks the best
            const contextDocs = await ragEngine.search(repoKey, searchQuery, 15);
            sources = [...new Set(contextDocs.map(d => d.metadata?.path).filter(Boolean))];
            contextText = contextDocs.map(d =>
                `📄 File: ${d.metadata?.path || 'unknown'}\n\`\`\`\n${d.pageContent}\n\`\`\``
            ).join('\n\n---\n\n');
        } else {
            contextText = '⚠️ Repository not indexed. Analysis based on stack trace only.';
        }

        // --- Step 3: Build the AI prompt ---
        const prompt = `You are a senior production incident responder and debugging expert for the repository "${repoKey}".

A production error has occurred. Analyze it thoroughly using the stack trace and the retrieved code context from the actual codebase.

## 🚨 Stack Trace / Error:
\`\`\`
${stackTrace}
\`\`\`

## 📂 Retrieved Code Context (from repository):
${contextText}

---

Respond in this EXACT structured format with rich markdown:

## 🔴 Incident Summary
One clear sentence: what crashed, where, and the immediate symptom.

## 🔍 Root Cause Analysis
- The **exact reason** this error occurred (reference specific file/function/line from context)
- The chain of events: what triggered what
- Why this specific code path failed
- Any environment or data conditions that likely caused it

## 📂 Affected Files & Functions
For each affected file/function identified:
| File | Function/Component | Issue |
|------|--------------------|-------|
| ... | ... | ... |

## 🛠️ Step-by-Step Fix
Numbered steps with exact code changes:

### Fix 1 (Primary): [descriptive name]
**Where**: \`filename.js\` → \`functionName()\`
**Before** (broken):
\`\`\`javascript
// the broken code
\`\`\`
**After** (fixed):
\`\`\`javascript
// the fixed code
\`\`\`
**Why this fixes it**: explanation

### Fix 2 (Defensive): [name]
Show a defensive/preventive fix even if Fix 1 is the main one.

## 🛡️ Prevention Strategy
- How to prevent this in future (defensive coding, validation, null checks)
- Relevant tests to add
- Monitoring/alerting suggestion (e.g., "add a Sentry boundary here")

## 📊 Confidence Assessment
- **Confidence**: [🟢 High / 🟡 Medium / 🔴 Low] 
- **Reason**: Explain confidence level based on how much context was available

## 🔗 Similar Issues to Watch
List 2-3 other places in the codebase (if visible from context) that may have the same vulnerability.`;

        // --- Step 4: Stream the response ---
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Send sources metadata first as a special event
        res.write(`data: ${JSON.stringify({ type: 'meta', sources })}\n\n`);

        // Use smart streaming for incident debugging (routes to Poolside)
        await llmStream(prompt, res, { type: 'incident', sseType: 'chunk' });
        res.end();

    } catch (error) {
        console.error('Incident Debugger Error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
        res.end();
    }
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ Secure Backend API running closely at http://localhost:${PORT}`);
    });
}

// Export for Vercel Serverless
export default app;
