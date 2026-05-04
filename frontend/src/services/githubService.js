// src/services/githubService.js

const API_BASE = 'http://localhost:3001/api';

/**
 * Parses a GitHub URL to extract the owner and repo name.
 * @param {string} url - The full GitHub repository URL.
 * @returns {{owner: string, repo: string}|null}
 */
export const parseRepoUrl = (url) => {
    try {
        const { pathname } = new URL(url);
        const pathParts = pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2) {
            const owner = pathParts[0];
            const repo = pathParts[1].replace(/\.git$/, '');
            return { owner, repo };
        }
    } catch (e) {
        return null;
    }
    return null;
};

/**
 * Fetches the file tree for a given repository via Express backend.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {AbortSignal} signal - AbortController signal to cancel the request.
 * @returns {Promise<Array>} A list of file objects.
 */
export const fetchRepoTree = async (owner, repo, signal) => {
    const response = await fetch(`${API_BASE}/github/tree`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo }),
        signal
    });
    
    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to fetch repo tree (${response.status})`);
    }
    
    const data = await response.json();
    return data.files; // Backend already filters for 'blob'
};

/**
 * Fetches the raw content of a specific file via Express backend.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string} path - The file path within the repo.
 * @param {AbortSignal} signal - AbortController signal
 * @returns {Promise<string>} The raw text content of the file.
 */
export const fetchFileContent = async (owner, repo, path, signal) => {
    const response = await fetch(`${API_BASE}/github/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo, path }),
        signal
    });
    
    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to fetch file content (${response.status})`);
    }
    
    return await response.text();
};