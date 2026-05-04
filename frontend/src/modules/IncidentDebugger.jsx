// src/modules/IncidentDebugger.jsx
import React, { useState, useRef } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import Loader from '../shared/Loader';

const EXAMPLE_TRACES = [
    {
        label: 'TypeError (undefined)',
        icon: '💣',
        value: `TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (UserList.jsx:23:18)
    at renderWithHooks (react-dom.development.js:16305:18)
    at mountIndeterminateComponent (react-dom.development.js:20074:13)
    at beginWork (react-dom.development.js:21587:16)`,
    },
    {
        label: 'Async / Promise rejection',
        icon: '⏱️',
        value: `UnhandledPromiseRejection: Error: Request failed with status code 401
    at createError (createError.js:16:15)
    at settle (settle.js:17:12)
    at XMLHttpRequest.handleLoad (xhr.js:62:7)
    at dispatchEvent (axios.js:49:3)`,
    },
    {
        label: 'Node.js module error',
        icon: '🔴',
        value: `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'langchain' imported from D:\\project\\backend\\ragEngine.js
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:266:9)
    at packageResolve (node:internal/modules/esm/resolve:767:81)
    at moduleResolve (node:internal/modules/esm/resolve:853:18)`,
    },
];

// Streaming fetch helper matching the backend SSE protocol
const streamAnalyzeError = async ({ owner, repo, stackTrace, onMeta, onChunk, onDone, onError }) => {
    const response = await fetch('http://localhost:3001/api/rag/analyze-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo, stackTrace }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(err.error || 'Request failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.replace('data: ', '').trim();
            if (raw === '[DONE]') { onDone?.(); return; }
            try {
                const event = JSON.parse(raw);
                if (event.type === 'meta')  onMeta?.(event.sources);
                if (event.type === 'chunk') onChunk?.(event.chunk);
                if (event.type === 'error') onError?.(event.error);
            } catch (_) {}
        }
    }
};

// ── Confidence Badge ─────────────────────────────────────────────────────────
const ConfidenceBadge = ({ text }) => {
    if (!text) return null;
    const color = text.includes('High') ? '#22c55e' : text.includes('Medium') ? '#eab308' : '#ef4444';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '2px 10px', borderRadius: '99px', fontSize: '12px',
            fontWeight: 700, border: `1px solid ${color}40`, color, background: `${color}15`,
        }}>
            {text}
        </span>
    );
};

// ── Source File Chips ────────────────────────────────────────────────────────
const SourceChips = ({ sources }) => {
    if (!sources?.length) return null;
    return (
        <div className="incident-sources">
            <span className="incident-sources-label">📂 Related Files Found:</span>
            <div className="incident-chips">
                {sources.map((s, i) => (
                    <span key={i} className="incident-chip">{s}</span>
                ))}
            </div>
        </div>
    );
};

// ── Main Component ───────────────────────────────────────────────────────────
const IncidentDebugger = ({ repoInfo, isIndexComplete, onError }) => {
    const [stackTrace, setStackTrace]   = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisText, setAnalysisText] = useState('');
    const [sources, setSources]         = useState([]);
    const [phase, setPhase]             = useState('input'); // 'input' | 'analyzing' | 'result'
    const [errorMsg, setErrorMsg]       = useState('');
    const [copied, setCopied]           = useState(false);
    const textareaRef = useRef(null);

    const handleAnalyze = async () => {
        if (!stackTrace.trim() || !repoInfo) return;
        setIsAnalyzing(true);
        setPhase('analyzing');
        setAnalysisText('');
        setSources([]);
        setErrorMsg('');

        try {
            await streamAnalyzeError({
                owner: repoInfo.owner,
                repo:  repoInfo.repo,
                stackTrace,
                onMeta:  (s) => setSources(s || []),
                onChunk: (c) => setAnalysisText(prev => prev + c),
                onDone:  ()  => { setPhase('result'); setIsAnalyzing(false); },
                onError: (e) => { setErrorMsg(e); setPhase('input'); setIsAnalyzing(false); },
            });
        } catch (err) {
            setErrorMsg(err.message);
            setPhase('input');
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setPhase('input');
        setAnalysisText('');
        setSources([]);
        setErrorMsg('');
        setStackTrace('');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(analysisText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadExample = (val) => {
        setStackTrace(val);
        textareaRef.current?.focus();
    };

    // ── No repo loaded guard ─────────────────────────────────────────────────
    if (!repoInfo) {
        return (
            <div className="incident-empty">
                <div className="incident-empty-icon">🚨</div>
                <h3>Production Incident Debugger</h3>
                <p>Load a GitHub repository first to use the Incident Debugger.</p>
            </div>
        );
    }

    // ── Analyzing state ──────────────────────────────────────────────────────
    if (phase === 'analyzing') {
        return (
            <div className="incident-analyzing">
                <Loader message="🔍 Parsing stack trace & searching codebase..." />
                {sources.length > 0 && <SourceChips sources={sources} />}
                {analysisText && (
                    <div className="incident-stream-preview">
                        <div className="ai-markdown-output prose prose-invert prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(analysisText)) }}
                        />
                    </div>
                )}
            </div>
        );
    }

    // ── Result state ─────────────────────────────────────────────────────────
    if (phase === 'result') {
        return (
            <div className="incident-result-wrapper">
                <div className="incident-result-toolbar">
                    <button onClick={handleReset} className="incident-toolbar-btn incident-back-btn">
                        ← New Incident
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {!isIndexComplete && (
                            <span className="incident-warning-badge">⚠️ Repo not indexed — index for better accuracy</span>
                        )}
                        <SourceChips sources={sources} />
                        <button onClick={handleCopy} className="incident-toolbar-btn">
                            {copied ? '✅ Copied!' : '📋 Copy Report'}
                        </button>
                    </div>
                </div>
                <div className="incident-result-scroll">
                    <div className="ai-markdown-output prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(analysisText)) }}
                    />
                </div>
            </div>
        );
    }

    // ── Input state ──────────────────────────────────────────────────────────
    return (
        <div className="incident-debugger">
            {/* Header */}
            <div className="incident-header">
                <div className="incident-header-icon">🚨</div>
                <div>
                    <h3 className="incident-title">Production Incident Debugger</h3>
                    <p className="incident-subtitle">
                        Paste a stack trace or error log — AI will find the root cause in your{' '}
                        <strong style={{ color: '#a78bfa' }}>{repoInfo.owner}/{repoInfo.repo}</strong> codebase
                        {isIndexComplete
                            ? <span className="incident-indexed-badge">✅ Indexed</span>
                            : <span className="incident-unindexed-badge">⚠️ Not indexed</span>
                        }
                    </p>
                </div>
            </div>

            {/* How it works */}
            <div className="incident-how-it-works">
                <span className="incident-step">1️⃣ Parse stack trace</span>
                <span className="incident-arrow">→</span>
                <span className="incident-step">2️⃣ Search RAG index</span>
                <span className="incident-arrow">→</span>
                <span className="incident-step">3️⃣ AI analyses with code context</span>
                <span className="incident-arrow">→</span>
                <span className="incident-step">4️⃣ Root cause + fix</span>
            </div>

            {/* Example Traces */}
            <div className="incident-examples-label">Try an example:</div>
            <div className="incident-examples">
                {EXAMPLE_TRACES.map((ex, i) => (
                    <button key={i} className="incident-example-btn" onClick={() => loadExample(ex.value)}>
                        {ex.icon} {ex.label}
                    </button>
                ))}
            </div>

            {/* Stack Trace Input */}
            <div className="incident-input-wrapper">
                <label className="incident-input-label">
                    Stack Trace / Error Log
                    {stackTrace && (
                        <span className="incident-char-count">{stackTrace.length} chars</span>
                    )}
                </label>
                <textarea
                    ref={textareaRef}
                    className="incident-textarea"
                    value={stackTrace}
                    onChange={(e) => setStackTrace(e.target.value)}
                    placeholder={`Paste your production error here...\n\nExample:\nTypeError: Cannot read properties of undefined (reading 'map')\n    at UserList (UserList.jsx:23:18)\n    at renderWithHooks (react-dom.development.js:16305:18)\n    at mountIndeterminateComponent (react-dom.development.js:20074:13)`}
                    rows={9}
                    spellCheck={false}
                />
            </div>

            {/* Hint + Analyze button */}
            <div className="incident-actions">
                <p className="incident-hint">
                    {isIndexComplete
                        ? '🧠 RAG index active — AI will match stack trace to your actual code'
                        : '💡 Index the workspace for more accurate file-level analysis'}
                </p>
                <button
                    className="incident-analyze-btn"
                    onClick={handleAnalyze}
                    disabled={!stackTrace.trim() || isAnalyzing}
                >
                    🚨 Analyze Incident
                </button>
            </div>

            {errorMsg && (
                <div className="incident-error-msg">❌ {errorMsg}</div>
            )}
        </div>
    );
};

export default IncidentDebugger;
