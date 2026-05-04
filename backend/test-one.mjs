import Groq from 'groq-sdk';

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const model = 'groq/compound';
console.log(`Testing Groq model: ${model} ...`);

const start = Date.now();
try {
    const completion = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: 'Say OK and nothing else.' }],
        max_tokens: 10,
    });
    const reply = completion.choices[0]?.message?.content?.trim();
    console.log(`✅ WORKING (${Date.now() - start}ms) → "${reply}"`);
} catch (e) {
    console.log(`❌ FAILED → ${e.message.split('\n')[0]}`);
}
