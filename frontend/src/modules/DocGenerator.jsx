// src/modules/DocGenerator.jsx
import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import Loader from '../shared/Loader';

const DOC_TYPES = [
    {
        id: 'readme',
        icon: '📖',
        title: 'README',
        description: 'Professional README with badges, install, usage, API, and more',
    },
    {
        id: 'api',
        icon: '🔌',
        title: 'API Docs',
        description: 'Detailed endpoint/function documentation with params & returns',
    },
    {
        id: 'jsdoc',
        icon: '📝',
        title: 'JSDoc / Docstrings',
        description: 'Inline documentation comments for every function & class',
    },
    {
        id: 'usage',
        icon: '🚀',
        title: 'Usage Examples',
        description: 'Real-world code examples showing how to use the module',
    },
    {
        id: 'changelog',
        icon: '📋',
        title: 'Changelog',
        description: 'Version changelog inferred from code structure & patterns',
    },
    {
        id: 'architecture',
        icon: '🏗️',
        title: 'Architecture Doc',
        description: 'System design overview with component relationships',
    },
];

const DocGenerator = ({ docContent, isLoading, onGenerate, error }) => {
    const [selectedType, setSelectedType] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = () => {
        if (selectedType) {
            onGenerate(selectedType);
        }
    };

    const handleCopy = () => {
        if (docContent) {
            navigator.clipboard.writeText(docContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = (format) => {
        if (!docContent) return;
        let content = docContent;
        let ext = 'md';
        let mimeType = 'text/markdown';

        if (format === 'html') {
            content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation</title>
    <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; background: #0f172a; color: #e2e8f0; }
        h1, h2, h3 { color: #c4b5fd; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
        code { background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: 'Fira Code', monospace; color: #a78bfa; }
        pre { background: #1e293b; padding: 1rem; border-radius: 8px; overflow-x: auto; border: 1px solid #334155; }
        pre code { background: none; padding: 0; color: #e2e8f0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #334155; padding: 0.5rem; text-align: left; }
        th { background: #1e293b; color: #c4b5fd; }
        blockquote { border-left: 3px solid #8b5cf6; margin: 1rem 0; padding: 0.5rem 1rem; color: #94a3b8; }
        a { color: #818cf8; }
        img { max-width: 100%; }
    </style>
</head>
<body>
${DOMPurify.sanitize(marked.parse(docContent))}
</body>
</html>`;
            ext = 'html';
            mimeType = 'text/html';
        }

        const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `documentation.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Show type selector when no content yet
    if (!docContent && !isLoading) {
        return (
            <div className="doc-generator">
                <div className="doc-header">
                    <h3 className="doc-main-title">📝 Documentation Generator</h3>
                    <p className="doc-subtitle">Select a documentation type to generate</p>
                </div>

                <div className="doc-type-grid">
                    {DOC_TYPES.map((type) => (
                        <button
                            key={type.id}
                            className={`doc-type-card ${selectedType === type.id ? 'doc-type-selected' : ''}`}
                            onClick={() => setSelectedType(type.id)}
                        >
                            <span className="doc-type-icon">{type.icon}</span>
                            <span className="doc-type-title">{type.title}</span>
                            <span className="doc-type-desc">{type.description}</span>
                        </button>
                    ))}
                </div>

                {selectedType && (
                    <div className="doc-generate-bar">
                        <div className="doc-selected-info">
                            <span className="doc-selected-badge">
                                {DOC_TYPES.find(t => t.id === selectedType)?.icon}{' '}
                                {DOC_TYPES.find(t => t.id === selectedType)?.title}
                            </span>
                        </div>
                        <button onClick={handleGenerate} className="doc-generate-btn" disabled={isLoading}>
                            ✨ Generate Documentation
                        </button>
                    </div>
                )}

                {error && <div className="doc-error">{error}</div>}
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="doc-generator">
                <div className="doc-loading">
                    <Loader message="Generating documentation... This may take a moment." />
                </div>
            </div>
        );
    }

    // Show generated documentation
    return (
        <div className="doc-generator">
            <div className="doc-toolbar">
                <button
                    onClick={() => onGenerate(null)}
                    className="doc-toolbar-btn doc-back-btn"
                    title="Back to type selection"
                >
                    ← Back
                </button>
                <div className="doc-toolbar-spacer"></div>
                <button onClick={handleCopy} className="doc-toolbar-btn">
                    {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
                <button onClick={() => handleDownload('md')} className="doc-toolbar-btn">
                    📥 .md
                </button>
                <button onClick={() => handleDownload('html')} className="doc-toolbar-btn">
                    🌐 .html
                </button>
            </div>
            <div className="doc-preview">
                <div
                    className="ai-markdown-output"
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(marked.parse(docContent)),
                    }}
                />
            </div>
        </div>
    );
};

export default DocGenerator;
