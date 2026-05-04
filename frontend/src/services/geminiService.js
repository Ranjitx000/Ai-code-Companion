// src/services/geminiService.js

import { cleanAiResponse } from '../utils/formatHelpers';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/gemini`;

/**
 * Robustly extract JSON from an AI response string.
 * Tries multiple strategies because Gemini sometimes wraps JSON in markdown,
 * adds prose before/after, or uses single quotes instead of double quotes.
 */
function extractJson(text) {
    if (!text || typeof text !== 'string') throw new Error('Empty response from AI.');

    // Strategy 1: already clean JSON
    try { return JSON.parse(text.trim()); } catch (_) {}

    // Strategy 2: strip ```json ... ``` or ``` ... ``` fences
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch) {
        try { return JSON.parse(fenceMatch[1].trim()); } catch (_) {}
    }

    // Strategy 3: find the first { ... } or [ ... ] block in the text
    const firstBrace   = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    const starts       = [firstBrace, firstBracket].filter(i => i !== -1);
    if (starts.length > 0) {
        const start    = Math.min(...starts);
        const lastBrace   = text.lastIndexOf('}');
        const lastBracket = text.lastIndexOf(']');
        const end      = Math.max(lastBrace, lastBracket);
        if (end > start) {
            try { return JSON.parse(text.slice(start, end + 1)); } catch (_) {}
        }
    }

    // Strategy 4: replace single-quoted keys/values → double quotes and retry
    try {
        const fixed = text
            .replace(/```(?:json)?|```/g, '')
            .replace(/'/g, '"')
            .trim();
        return JSON.parse(fixed);
    } catch (_) {}

    // All strategies failed — log raw text to help debugging
    console.error('❌ Could not parse AI JSON. Raw response:\n', text.slice(0, 500));
    throw new Error('AI returned malformed JSON. Raw: ' + text.slice(0, 120));
}

/**
 * Calls the local Express backend proxy with streaming enabled.
 * @param {string} prompt - The prompt to send.
 * @param {function} onChunk - Callback for each text chunk.
 */
export const streamGemini = async (prompt, onChunk, type = 'explanation') => {
    const response = await fetch(`${API_BASE}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type })
    });

    if (!response.ok) {
        throw new Error(`Streaming failed: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let isDone = false;

    while (!isDone) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '').trim();
                if (dataStr === '[DONE]') {
                    isDone = true;
                    break;
                }
                try {
                    const { chunk, error } = JSON.parse(dataStr);
                    if (error) throw new Error(error);
                    if (chunk) onChunk(chunk);
                } catch (e) {
                    // Skip malformed chunks
                }
            }
        }
    }
};

/**
 * Calls the local Express backend proxy which then talks to the Gemini API securely.
 * @param {string} prompt - The prompt to send to the model.
 * @param {boolean} expectJson - Whether to parse the response as JSON.
 * @returns {Promise<string|Object>} The processed response from the AI.
 */
export const callGemini = async (prompt, expectJson = false, type = 'explanation') => {
    const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, isJson: expectJson, type })
    });

    if (!response.ok) {
        let errorBody;
        try {
            errorBody = await response.json();
        } catch (e) {
            throw new Error(`Backend Error: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorBody.error || errorBody.details || 'Unknown server error');
    }

    const { result } = await response.json();

    if (!result) {
        throw new Error("AI returned an empty or invalid response.");
    }

    if (expectJson) {
        return extractJson(result); // ✅ robust multi-strategy JSON parser
    }

    return result;
};