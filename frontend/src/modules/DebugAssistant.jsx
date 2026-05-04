// src/modules/DebugAssistant.jsx
import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import Loader from '../shared/Loader';

const DEBUG_MODES = [
    {
        id: 'error',
        icon: '🔴',
        title: 'Error / Stack Trace',
        description: 'Paste an error message or stack trace to get root cause analysis and fix',
        placeholder: 'Paste your error message, stack trace, or console output here...\n\nExample:\nTypeError: Cannot read properties of undefined (reading \'map\')\n    at UserList (UserList.jsx:12:34)\n    at renderWithHooks (react-dom.development.js:16305:18)',
    },
    {
        id: 'bug',
        icon: '🐛',
        title: 'Bug Description',
        description: 'Describe unexpected behavior — AI will find the bug in your code',
        placeholder: 'Describe what\'s happening vs what you expect...\n\nExample:\nThe form submits successfully but the data is not saved to the database. The API returns 200 but the record doesn\'t appear in the list.',
    },
    {
        id: 'performance',
        icon: '🐌',
        title: 'Performance Issue',
        description: 'Component slow? Memory leak? Get optimization solutions',
        placeholder: 'Describe the performance issue...\n\nExample:\nThe page freezes for 2-3 seconds when rendering a list of 500+ items. The component re-renders on every keystroke in the search box.',
    },
    {
        id: 'logic',
        icon: '🧩',
        title: 'Logic Error',
        description: 'Code runs without errors but produces wrong results',
        placeholder: 'Describe the expected vs actual behavior...\n\nExample:\nThe calculateTotal function should return 150 for items [50, 50, 50] but returns 100. The discount logic seems to apply twice.',
    },
    {
        id: 'async',
        icon: '⏱️',
        title: 'Async / Race Condition',
        description: 'Promise issues, stale state, timing bugs, async/await problems',
        placeholder: 'Describe the async issue...\n\nExample:\nData fetched in useEffect shows stale values. When clicking quickly between items, the wrong data appears. setState doesn\'t reflect the latest value.',
    },
    {
        id: 'type',
        icon: '🏷️',
        title: 'Type / TypeScript Error',
        description: 'Fix TypeScript errors, type mismatches, and generic issues',
        placeholder: 'Paste the TypeScript error...\n\nExample:\nType \'string | undefined\' is not assignable to type \'string\'.\nArgument of type \'{ name: string; }\' is not assignable to parameter of type \'User\'.',
    },
];

const DebugAssistant = ({ debugResult, isLoading, onDebug, error }) => {
    const [selectedMode, setSelectedMode] = useState(null);
    const [errorInput, setErrorInput] = useState('');
    const [copied, setCopied] = useState(false);

    const handleDebug = () => {
        if (selectedMode && errorInput.trim()) {
            onDebug(selectedMode, errorInput);
        }
    };

    const handleCopy = () => {
        if (debugResult) {
            navigator.clipboard.writeText(debugResult);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleBack = () => {
        onDebug(null, null); // Clear results
        setSelectedMode(null);
        setErrorInput('');
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="debug-assistant">
                <div className="debug-loading">
                    <Loader message="🔍 Analyzing the issue... Diagnosing root cause..." />
                </div>
            </div>
        );
    }

    // Show results
    if (debugResult) {
        return (
            <div className="debug-assistant">
                <div className="debug-result-toolbar">
                    <button onClick={handleBack} className="debug-toolbar-btn debug-back-btn">
                        ← New Debug
                    </button>
                    <div className="debug-toolbar-spacer"></div>
                    <button onClick={handleCopy} className="debug-toolbar-btn">
                        {copied ? '✅ Copied!' : '📋 Copy'}
                    </button>
                </div>
                <div className="debug-result-scroll">
                    <div
                        className="ai-markdown-output"
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(marked.parse(debugResult)),
                        }}
                    />
                </div>
            </div>
        );
    }

    // Mode selection + input
    return (
        <div className="debug-assistant">
            <div className="debug-header">
                <h3 className="debug-main-title">🐛 Debug Assistant</h3>
                <p className="debug-subtitle">Select the type of issue you're facing</p>
            </div>

            {/* Mode Selector */}
            <div className="debug-mode-grid">
                {DEBUG_MODES.map((mode) => (
                    <button
                        key={mode.id}
                        className={`debug-mode-card ${selectedMode === mode.id ? 'debug-mode-selected' : ''}`}
                        onClick={() => setSelectedMode(mode.id)}
                    >
                        <span className="debug-mode-icon">{mode.icon}</span>
                        <div className="debug-mode-info">
                            <span className="debug-mode-title">{mode.title}</span>
                            <span className="debug-mode-desc">{mode.description}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Error Input Area */}
            {selectedMode && (
                <div className="debug-input-section">
                    <div className="debug-input-header">
                        <span className="debug-input-badge">
                            {DEBUG_MODES.find(m => m.id === selectedMode)?.icon}{' '}
                            {DEBUG_MODES.find(m => m.id === selectedMode)?.title}
                        </span>
                    </div>
                    <textarea
                        value={errorInput}
                        onChange={(e) => setErrorInput(e.target.value)}
                        placeholder={DEBUG_MODES.find(m => m.id === selectedMode)?.placeholder}
                        className="debug-textarea"
                        rows={6}
                    />
                    <div className="debug-actions">
                        <p className="debug-hint">
                            💡 The AI will analyze both your error and the code in the editor above
                        </p>
                        <button
                            onClick={handleDebug}
                            className="debug-analyze-btn"
                            disabled={!errorInput.trim() || isLoading}
                        >
                            🔍 Analyze & Fix
                        </button>
                    </div>
                </div>
            )}

            {error && <div className="debug-error">{error}</div>}
        </div>
    );
};

export default DebugAssistant;
