import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs";
import path from "path";
import os from "os";

// ---------------------------------------------------------------------------
// Cache directory for persisting indexes across restarts
// ---------------------------------------------------------------------------
const CACHE_DIR = path.join(os.tmpdir(), "rag-cache");

// ---------------------------------------------------------------------------
// Language map: extension → human-readable language name
// ---------------------------------------------------------------------------
const LANG_MAP = {
    js:   "javascript",
    jsx:  "react",
    ts:   "typescript ",
    tsx:  "react-typescript",
    py:   "python",
    css:  "css",
    json: "json",
    md:   "markdown",
    html: "html",
    vue:  "vue",
    svelte: "svelte",
    go:   "go",
    rb:   "ruby",
    java: "java",
    rs:   "rust",
    cpp:  "cpp",
    c:    "c",
};

// ---------------------------------------------------------------------------
// Lightweight in-memory vector store (cosine similarity)
// ---------------------------------------------------------------------------
class InMemoryVectorStore {
    constructor() {
        this.docs    = []; // { pageContent, metadata }
        this.vectors = []; // number[][] per doc
    }

    /** Add pre-embedded documents */
    addVectors(vectors, docs) {
        for (let i = 0; i < vectors.length; i++) {
            this.vectors.push(vectors[i]);
            this.docs.push(docs[i]);
        }
    }

    /** Cosine similarity between two arrays */
    _cosine(a, b) {
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < a.length; i++) {
            dot   += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
    }

    /** Return k most similar documents (raw, before reranking) */
    similaritySearchByVector(queryVector, k = 10) {
        const scored = this.vectors.map((vec, i) => ({
            score: this._cosine(queryVector, vec),
            doc:   this.docs[i],
        }));
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, k).map(s => s.doc);
    }

    /** Serialize for disk persistence */
    toJSON() {
        return { docs: this.docs, vectors: this.vectors };
    }

    /** Restore from serialized data */
    static fromJSON({ docs, vectors }) {
        const store = new InMemoryVectorStore();
        store.docs    = docs;
        store.vectors = vectors;
        return store;
    }
}

// ---------------------------------------------------------------------------
// RAG Engine — Optimized for code repositories
// ---------------------------------------------------------------------------
class RAGEngine {
    constructor() {
        this.vectorStores = new Map(); // repoKey -> InMemoryVectorStore
        this._embeddings  = null;      // lazy-init after dotenv loads
    }

    /**
     * Lazily create embeddings on first use.
     * Provider is controlled by EMBEDDING_PROVIDER env var:
     *   'huggingface' (default, free) | 'gemini' | 'nomic' | 'cohere'
     */
    get embeddings() {
        if (!this._embeddings) {
            // Default to 'gemini' for significantly faster embeddings (no cold starts)
            const provider = (process.env.EMBEDDING_PROVIDER || 'gemini').toLowerCase();
            this._embeddings = RAGEngine._buildEmbeddings(provider);
            console.log(`🔢 Embedding provider: ${provider}`);
        }
        return this._embeddings;
    }

    /**
     * Build the correct embeddings client for the given provider.
     */
    static _buildEmbeddings(provider) {
        switch (provider) {

            // HuggingFace Inference API — FREE, no credit card needed
            // Get free token at https://huggingface.co/settings/tokens
            case 'huggingface':
            default:
                return new HuggingFaceInferenceEmbeddings({
                    apiKey: process.env.HUGGINGFACE_API_KEY || '',
                    model:  process.env.HF_EMBEDDING_MODEL
                              || 'sentence-transformers/all-MiniLM-L6-v2',
                });

            // Nomic — excellent quality, free on HuggingFace
            case 'nomic':
                return new HuggingFaceInferenceEmbeddings({
                    apiKey: process.env.HUGGINGFACE_API_KEY || '',
                    model:  'nomic-ai/nomic-embed-text-v1.5',
                });

            // Cohere — multilingual, free tier 1000 calls/month
            case 'cohere':
                return new HuggingFaceInferenceEmbeddings({
                    apiKey: process.env.HUGGINGFACE_API_KEY || '',
                    model:  'Cohere/Cohere-embed-multilingual-light-v3.0',
                });

            // Google Gemini — needs GEMINI_API_KEY
            case 'gemini':
                return new GoogleGenerativeAIEmbeddings({
                    apiKey:     process.env.GEMINI_API_KEY,
                    modelName:  'text-embedding-004',
                    apiVersion: 'v1',
                });
        }
    }

    // -----------------------------------------------------------------------
    // Disk Persistence
    // -----------------------------------------------------------------------

    /** Save index to disk so it survives server restarts */
    saveIndex(repoKey) {
        try {
            if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
            const store    = this.vectorStores.get(repoKey);
            const filePath = this._cacheFile(repoKey);
            fs.writeFileSync(filePath, JSON.stringify(store.toJSON()));
            console.log(`💾 Index saved: ${filePath}`);
        } catch (err) {
            console.warn("⚠️  Could not save index to disk:", err.message);
        }
    }

    /** Load index from disk if available — returns true if loaded */
    loadIndex(repoKey) {
        const filePath = this._cacheFile(repoKey);
        if (!fs.existsSync(filePath)) return false;
        try {
            const raw   = fs.readFileSync(filePath, "utf-8");
            const store = InMemoryVectorStore.fromJSON(JSON.parse(raw));
            this.vectorStores.set(repoKey, store);
            console.log(`📂 Loaded index from disk: ${repoKey} (${store.docs.length} chunks)`);
            return true;
        } catch (err) {
            console.warn("⚠️  Corrupted cache, will re-index:", err.message);
            return false;
        }
    }

    /** Delete cached index from disk */
    clearIndex(repoKey) {
        const filePath = this._cacheFile(repoKey);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        this.vectorStores.delete(repoKey);
        console.log(`🗑️  Cleared index: ${repoKey}`);
    }

    _cacheFile(repoKey) {
        return path.join(CACHE_DIR, repoKey.replace("/", "_") + ".json");
    }

    // -----------------------------------------------------------------------
    // Fetching & Indexing
    // -----------------------------------------------------------------------

    /**
     * Fetch all text files from GitHub and index them.
     * Skips if already in memory. Tries disk cache before re-embedding.
     */
    async fetchAndIndex(owner, repo, token) {
        const repoKey = `${owner}/${repo}`;

        // 1. Already in memory
        if (this.hasIndex(repoKey)) {
            console.log(`✅ Index already in memory: ${repoKey}`);
            return;
        }

        // 2. Try loading from disk cache
        if (this.loadIndex(repoKey)) return;

        // 3. Full re-index
        console.log(`📡 Fetching files for indexing: ${repoKey}`);
        const headers = token ? { Authorization: `token ${token}` } : {};

        try {
            const repoResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}`,
                { headers }
            );
            if (!repoResponse.ok) throw new Error("Repo not found");
            const { default_branch } = await repoResponse.json();

            const treeResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/git/trees/${default_branch}?recursive=1`,
                { headers }
            );
            const { tree } = await treeResponse.json();

            // ✅ Increased from 100 → 200 files
            const textFiles = tree
                .filter(item => item.type === "blob" && this.isTextFile(item.path))
                .slice(0, 200);

            console.log(`📁 Found ${textFiles.length} indexable files`);

            const batchSize = 10;
            const allFiles  = [];

            for (let i = 0; i < textFiles.length; i += batchSize) {
                const batch   = textFiles.slice(i, i + batchSize);
                const results = await Promise.all(
                    batch.map(async file => {
                        try {
                            const res = await fetch(
                                `https://raw.githubusercontent.com/${owner}/${repo}/${default_branch}/${file.path}`,
                                { headers }
                            );
                            if (res.ok) return { path: file.path, content: await res.text() };
                        } catch (_) {}
                        return null;
                    })
                );
                allFiles.push(...results.filter(Boolean));
            }

            await this.indexRepository(repoKey, allFiles);
            this.saveIndex(repoKey); // persist to disk
        } catch (error) {
            console.error("Fetch/Index Error:", error);
            throw error;
        }
    }

    async indexRepository(repoKey, files) {
        console.log(`🚀 Indexing ${repoKey}: ${files.length} files`);

        // ✅ OPTIMIZED: Smaller chunks (500) + 20% overlap (100) + code-aware separators
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize:    500,
            chunkOverlap: 100,
            separators: [
                "\nclass ",       // class boundaries first
                "\nfunction ",    // named functions
                "\nconst ",       // arrow/const functions
                "\nexport ",      // module exports
                "\nasync ",       // async functions
                "\n\n\n",         // triple blank lines
                "\n\n",           // double blank lines
                "\n",             // single lines
                " ",              // words
            ],
        });

        const docs = [];
        for (const file of files) {
            // ✅ OPTIMIZED: Enriched metadata per chunk
            const ext      = file.path.split(".").pop().toLowerCase();
            const language = LANG_MAP[ext] || ext;
            const filename = file.path.split("/").pop();

            const chunks = await splitter.createDocuments(
                [file.content],
                [{
                    path:     file.path,
                    repo:     repoKey,
                    language,           // NEW: programming language
                    filename,           // NEW: just the filename for quick ref
                    ext,                // NEW: file extension
                }]
            );

            // Annotate each chunk with its index within the file
            chunks.forEach((chunk, idx) => {
                chunk.metadata.chunkIndex = idx;
                chunk.metadata.totalChunks = chunks.length;
            });

            docs.push(...chunks);
        }

        console.log(`📝 Created ${docs.length} chunks, embedding...`);

        // Embed in batches to avoid rate limits
        const embedBatchSize = 50;
        const allVectors     = [];

        for (let i = 0; i < docs.length; i += embedBatchSize) {
            const batch  = docs.slice(i, i + embedBatchSize);
            const texts  = batch.map(d => d.pageContent);
            const vecs   = await this.embeddings.embedDocuments(texts);
            allVectors.push(...vecs);
            console.log(`  Embedded ${Math.min(i + embedBatchSize, docs.length)}/${docs.length} chunks`);
        }

        const store = new InMemoryVectorStore();
        store.addVectors(allVectors, docs);
        this.vectorStores.set(repoKey, store);
        console.log(`✅ Indexed ${docs.length} chunks for ${repoKey}`);
    }

    // -----------------------------------------------------------------------
    // Search with Keyword Reranking
    // -----------------------------------------------------------------------

    /**
     * Search for relevant code chunks.
     * Fetches k*3 candidates via vector search, then reranks by keyword overlap.
     *
     * @param {string} repoKey
     * @param {string} query
     * @param {number} k - final number of results to return
     * @param {object} filter - optional metadata filter e.g. { language: 'javascript' }
     */
    async search(repoKey, query, k = 10, filter = null) {
        const store = this.vectorStores.get(repoKey);
        if (!store) return [];

        // Step 1: Vector search — fetch 3x candidates for reranking
        const queryVector = await this.embeddings.embedQuery(query);
        const candidates  = store.similaritySearchByVector(queryVector, k * 3);

        // Step 2: Optional metadata filtering
        const filtered = filter
            ? candidates.filter(doc =>
                Object.entries(filter).every(([key, val]) => doc.metadata[key] === val)
              )
            : candidates;

        // Step 3: Keyword reranking — boost chunks containing query terms
        const keywords = query
            .toLowerCase()
            .split(/[\s,.()\[\]{}<>:;'"!?\/\\]+/)
            .filter(w => w.length > 2); // ignore very short words

        const reranked = filtered.map(doc => {
            const text       = doc.pageContent.toLowerCase();
            const keywordHits = keywords.filter(kw => text.includes(kw)).length;
            const boost       = keywordHits * 0.05; // 0.05 bonus per keyword hit
            return { doc, boost };
        });

        // Sort by boost (desc) — ties keep vector order
        reranked.sort((a, b) => b.boost - a.boost);

        return reranked.slice(0, k).map(r => r.doc);
    }

    // -----------------------------------------------------------------------
    // Utilities
    // -----------------------------------------------------------------------

    isTextFile(filePath) {
        const ext = filePath.split(".").pop().toLowerCase();
        return Object.keys(LANG_MAP).includes(ext);
    }

    hasIndex(repoKey) {
        return this.vectorStores.has(repoKey);
    }

    /** Stats about the current index */
    indexStats(repoKey) {
        const store = this.vectorStores.get(repoKey);
        if (!store) return null;
        const languages = [...new Set(store.docs.map(d => d.metadata?.language).filter(Boolean))];
        const files     = [...new Set(store.docs.map(d => d.metadata?.path).filter(Boolean))];
        return {
            chunks:    store.docs.length,
            files:     files.length,
            languages,
        };
    }
}

export const ragEngine = new RAGEngine();
