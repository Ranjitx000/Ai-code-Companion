import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const TEST_PROMPT = 'Say "OK" and nothing else.';

const OPENROUTER_MODELS = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'google/gemma-3-27b-it:free',
    'mistralai/mistral-7b-instruct:free',
    'qwen/qwen-2.5-7b-instruct:free',
];

async function testOpenRouterModel(model) {
    const client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey:  process.env.OPENROUTER_API_KEY,
        defaultHeaders: {
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'Model Tester',
        },
    });
    const start = Date.now();
    const res = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: TEST_PROMPT }],
        max_tokens: 10,
    });
    const ms = Date.now() - start;
    return { ok: true, reply: res.choices[0]?.message?.content?.trim(), ms };
}

async function testGemini() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const start = Date.now();
    const result = await model.generateContent(TEST_PROMPT);
    const ms = Date.now() - start;
    return { ok: true, reply: result.response.text().trim(), ms };
}

async function run() {
    console.log('\n🧪 Model Health Check\n' + '='.repeat(50));

    // Test Gemini direct
    process.stdout.write('🔷 Gemini 2.5 Flash (direct) ... ');
    try {
        const { reply, ms } = await testGemini();
        console.log(`✅ WORKING  (${ms}ms) → "${reply}"`);
    } catch (e) {
        console.log(`❌ FAILED   → ${e.message.split('\n')[0]}`);
    }

    console.log();

    // Test OpenRouter models
    for (const model of OPENROUTER_MODELS) {
        process.stdout.write(`🔶 ${model} ... `);
        try {
            const { reply, ms } = await testOpenRouterModel(model);
            console.log(`✅ WORKING  (${ms}ms) → "${reply}"`);
        } catch (e) {
            const msg = e.message.split('\n')[0].slice(0, 80);
            console.log(`❌ FAILED   → ${msg}`);
        }
    }

    console.log('\n' + '='.repeat(50));
}

run();
