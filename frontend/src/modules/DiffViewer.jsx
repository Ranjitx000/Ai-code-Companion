// src/modules/DiffViewer.jsx
import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import Loader from '../shared/Loader';

const DiffViewer = ({ diffResult, isLoading, onAnalyze, error, currentEditorCode }) => {
    // If we have an active editor file, default to it as the "New Code"
    const [originalCode, setOriginalCode] = useState('');
    const [newCode, setNewCode] = useState(currentEditorCode || '');
    const [copied, setCopied] = useState(false);

    // Sync newCode if editor content changes (only if the user hasn't heavily modified it manually here, but for simplicity let's just sync it on mount or prop change)
    useEffect(() => {
        if (currentEditorCode && !newCode) {
            setNewCode(currentEditorCode);
        }
    }, [currentEditorCode, newCode]);

    const handleAnalyze = () => {
        if (originalCode.trim() && newCode.trim()) {
            onAnalyze(originalCode, newCode);
        }
    };

    const handleCopy = () => {
        if (diffResult) {
            navigator.clipboard.writeText(diffResult);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleReset = () => {
        onAnalyze(null, null); // Clear results
        setOriginalCode('');
        setNewCode(currentEditorCode || '');
    };

    if (isLoading) {
        return (
            <div className="diff-viewer">
                <div className="diff-loading">
                    <Loader message="🔀 Analyzing changes... Generating highlighted diff & explanations..." />
                </div>
            </div>
        );
    }

    if (diffResult) {
        return (
            <div className="diff-viewer">
                <div className="diff-toolbar">
                    <button onClick={handleReset} className="diff-btn diff-back-btn">
                        ← New Diff
                    </button>
                    <div className="diff-toolbar-spacer"></div>
                    <button onClick={handleCopy} className="diff-btn">
                        {copied ? '✅ Copied!' : '📋 Copy Report'}
                    </button>
                </div>
                <div className="diff-result-scroll">
                    <div
                        className="ai-markdown-output diff-rendered-output"
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(marked.parse(diffResult)),
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="diff-viewer">
            <div className="diff-header">
                <h3 className="diff-main-title">🔀 Code Diff Viewer</h3>
                <p className="diff-subtitle">Paste two versions of code to get an AI-explained highlighted diff</p>
            </div>

            <div className="diff-inputs-container">
                <div className="diff-pane">
                    <div className="diff-pane-header">
                        <span className="diff-pane-badge diff-original-badge">🔴 Original Code</span>
                    </div>
                    <textarea
                        className="diff-textarea"
                        placeholder="Paste the original / old code here..."
                        value={originalCode}
                        onChange={(e) => setOriginalCode(e.target.value)}
                    />
                </div>

                <div className="diff-pane">
                    <div className="diff-pane-header">
                        <span className="diff-pane-badge diff-new-badge">🟢 Modified Code</span>
                        {currentEditorCode && (
                            <span className="diff-pane-hint">(Loaded from Editor)</span>
                        )}
                    </div>
                    <textarea
                        className="diff-textarea"
                        placeholder="Paste the new / modified code here..."
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                    />
                </div>
            </div>

            <div className="diff-actions">
                <button
                    onClick={handleAnalyze}
                    className="diff-analyze-btn"
                    disabled={!originalCode.trim() || !newCode.trim() || isLoading}
                >
                    ✨ Analyze Changes
                </button>
            </div>

            {error && <div className="diff-error">{error}</div>}
        </div>
    );
};

export default DiffViewer;
