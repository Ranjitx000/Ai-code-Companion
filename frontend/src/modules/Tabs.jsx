import React, { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import MindMap from './MindMap';
import DocGenerator from './DocGenerator';
import DebugAssistant from './DebugAssistant';
import DiffViewer from './DiffViewer';
import IncidentDebugger from './IncidentDebugger';
import ArchitectureViewer from './ArchitectureViewer';
import Loader from '../shared/Loader';
import Button from '../shared/Button';

// Configure marked for beautiful output
marked.setOptions({
    breaks: true,
    gfm: true,
});

const TabButton = ({ name, activeTab, onClick, title }) => (
    <button
        onClick={() => onClick(name)}
        className={`px-3 py-2 text-[11px] uppercase font-medium whitespace-nowrap flex-shrink-0 transition-colors duration-150 cursor-pointer ${
            activeTab === name 
                ? 'text-[#e7e7e7] border-b-[1px] border-b-[#e7e7e7]' 
                : 'text-[#969696] hover:text-[#cccccc] border-b-[1px] border-b-transparent'
        }`}
    >
        {title}
    </button>
);

const Tabs = ({ activeTab, setActiveTab, analysis, isLoading, onGenerate, onAsk, error, currentEditorCode, isIndexComplete, repoInfo, hasOpenFile }) => {
    const scrollRef = useRef(null);
    
    // Auto-scroll for streaming output
    useEffect(() => {
        if (activeTab === 'explanation' && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [analysis.explanation, activeTab]);

    // ✅ FIX: separate state per input so tabs don't fight each other
    const [workspaceQuestion, setWorkspaceQuestion] = useState('');
    const [explanationQuestion, setExplanationQuestion] = useState('');

    const handleWorkspaceAsk = () => {
        if (!workspaceQuestion.trim()) return;
        onAsk(workspaceQuestion.trim());
    };

    const handleExplanationAsk = () => {
        onAsk(explanationQuestion.trim());
    };

    const renderContent = () => {
        if (activeTab === 'incident') {
            return (
                <IncidentDebugger
                    repoInfo={repoInfo}
                    isIndexComplete={isIndexComplete}
                />
            );
        }

        if (activeTab === 'workspace') {
            if (!isIndexComplete) {
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="text-4xl mb-4 opacity-50">🧠</div>
                        <h3 className="text-[14px] font-semibold mb-2 text-[#cccccc]">Workspace Intelligence</h3>
                        <p className="text-[13px] text-[#969696] mb-6">You need to index the repository first to ask workspace-wide questions.</p>
                        <p className="text-[12px] text-[#007acc]">Click the "Build Knowledge Base" button in the left sidebar to begin.</p>
                    </div>
                );
            }
            return (
                <div className="flex flex-col h-full">
                    <div className="flex items-center mb-4 gap-2">
                        <input
                            type="text"
                            value={workspaceQuestion}
                            onChange={(e) => setWorkspaceQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleWorkspaceAsk()}
                            placeholder="Ask anything across the entire codebase... (e.g. 'How is auth handled?')"
                            className="w-full p-2 bg-[#252526] border border-[#3c3c3c] focus:border-[#007acc] focus:outline-none text-[#cccccc] text-[13px] transition-colors"
                        />
                        <button
                            onClick={handleWorkspaceAsk}
                            disabled={isLoading || !workspaceQuestion.trim()}
                            className="bg-[#007acc] hover:bg-[#005f9e] text-white px-4 py-2 text-[13px] transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                            {isLoading ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    {/* Error display */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-900/40 border border-red-500/50 text-red-300 text-[13px] rounded">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center gap-3 text-[#969696] text-[13px] p-4">
                            <span className="animate-spin">🔍</span> Searching across codebase...
                        </div>
                    ) : analysis.workspaceAnswer ? (
                        <div className="space-y-4">
                            {/* Chunks used badge */}
                            {analysis.chunksUsed && (
                                <div className="text-[11px] text-[#969696] flex items-center gap-1">
                                    <span className="bg-[#007acc]/20 text-[#007acc] border border-[#007acc]/30 px-2 py-0.5 rounded">
                                        🔍 {analysis.chunksUsed} code chunks searched
                                    </span>
                                </div>
                            )}
                            <div
                                className="ai-markdown-output prose prose-invert prose-sm max-w-none text-[#cccccc]"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(analysis.workspaceAnswer)) }}
                            />
                            {analysis.sources && analysis.sources.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-[#3c3c3c]">
                                    <h4 className="text-xs font-bold text-[#cccccc] uppercase tracking-wider mb-2">Source Files:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.sources.map((s, i) => (
                                            <span key={i} className="text-[11px] bg-[#2d2d2d] border border-[#3c3c3c] px-2 py-1 text-[#007acc] font-mono">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center p-10 text-[#969696] border border-dashed border-[#3c3c3c] text-[13px]">
                            Ask anything about the project and I'll search across all indexed files.
                        </div>
                    )}
                </div>
            );
        }

        if (activeTab === 'diff') {
            return (
                <DiffViewer
                    diffResult={analysis.diffResult}
                    isLoading={isLoading}
                    error={error}
                    currentEditorCode={currentEditorCode}
                    onAnalyze={(original, modified) => onGenerate('diff', { original, modified })}
                />
            );
        }

        if (activeTab === 'docs') {
            return (
                <DocGenerator
                    docContent={analysis.docContent}
                    isLoading={isLoading}
                    error={error}
                    onGenerate={(docType) => onGenerate('docs', docType)}
                />
            );
        }

        if (activeTab === 'debug') {
            return (
                <DebugAssistant
                    debugResult={analysis.debugResult}
                    isLoading={isLoading}
                    error={error}
                    onDebug={(mode, input) => onGenerate('debug', { mode, input })}
                />
            );
        }

        if (activeTab === 'architecture') {
            if (isLoading) return <Loader message="🏗️ Analyzing project architecture with AI..." />;
            if (error) return (
                <div className="text-red-400 bg-red-900/30 border border-red-500/40 p-4 rounded-md text-[13px]">
                    <strong>Error:</strong> {error}
                </div>
            );
            return analysis.architecture ? (
                <ArchitectureViewer data={analysis.architecture} />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-3">
                    <div className="text-5xl mb-2 opacity-40">🏗️</div>
                    <h3 className="text-[14px] font-semibold text-[#cccccc]">Architecture &amp; Data Flow Diagram</h3>
                    {repoInfo ? (
                        <p className="text-[13px] text-[#969696] max-w-xs">
                            Click <strong className="text-[#cccccc]">Generate</strong> to analyze{' '}
                            <span className="text-[#007acc]">{repoInfo.owner}/{repoInfo.repo}</span>{' '}
                            and produce a RAG-powered DFD.
                        </p>
                    ) : (
                        <>
                            <p className="text-[13px] text-[#969696]">Load a GitHub repository first, then click Generate.</p>
                            <p className="text-[12px] text-[#007acc]">Paste a repo URL in the sidebar → REPOSITORY input.</p>
                        </>
                    )}
                </div>
            );
        }

        // Special case: for streaming tabs, show the content even if loading
        // so we can see the text grow.
        const isStreamingTab = ['explanation', 'incident'].includes(activeTab);
        const hasContent = activeTab === 'explanation' ? !!analysis.explanation : 
                          activeTab === 'incident' ? true : false; // incident has its own internal loader

        if (isLoading && !isStreamingTab) return <Loader message="AI is thinking..." />;
        
        if (error) return (
            <div className="text-red-400 bg-red-900/30 border border-red-500/40 p-4 rounded-md text-[13px]">
                <strong>Error:</strong> {error}
            </div>
        );

        // File-dependent tabs: show hint when no file is open
        const fileRequiredTabs = ['explanation', 'mindmap', 'quality', 'comment', 'tests', 'docs', 'debug', 'diff'];
        if (!hasOpenFile && fileRequiredTabs.includes(activeTab)) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-2">
                    <div className="text-4xl mb-2 opacity-30">📄</div>
                    <p className="text-[13px] text-[#969696]">Select a file from the explorer to use this panel.</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'explanation':
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center mb-4 sticky top-0 bg-[#1e1e1e] z-10 pb-2">
                            <input
                                type="text"
                                value={explanationQuestion}
                                onChange={(e) => setExplanationQuestion(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleExplanationAsk()}
                                placeholder="Ask a specific question about THIS file..."
                                className="w-full p-2 bg-[#252526] border border-[#3c3c3c] focus:border-[#007acc] focus:outline-none text-[#cccccc] text-[13px] transition-colors"
                            />
                            <button
                                onClick={handleExplanationAsk}
                                disabled={isLoading}
                                className="bg-[#007acc] hover:bg-[#005f9e] text-white px-4 py-2 text-[13px] transition-colors disabled:opacity-50 ml-2 whitespace-nowrap"
                            >
                                {isLoading && !analysis.explanation ? '...' : 'Ask AI'}
                            </button>
                        </div>
                        <div className="flex-1">
                            {isLoading && !analysis.explanation ? (
                                <div className="py-10 text-center text-[#969696] animate-pulse">
                                    AI is analyzing the file...
                                </div>
                            ) : analysis.explanation ? (
                                 <div className="ai-markdown-output prose prose-invert prose-sm max-w-none text-[#cccccc]" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(analysis.explanation)) }}></div>
                            ) : (
                                <div className="text-center p-10 text-[#969696] border border-dashed border-[#3c3c3c] text-[13px] rounded-lg">
                                    Ask a general question or something specific about the code in the editor.
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'mindmap':
                return analysis.mindMapData ? <MindMap data={analysis.mindMapData} /> : <p className="text-[#969696] text-[13px]">Click "Generate" to create a mind map of the code's structure.</p>;
            case 'quality': {
                // Normalize: AI may return an object with a nested array instead of a bare array
                let qualityItems = analysis.quality;
                if (qualityItems && !Array.isArray(qualityItems)) {
                    // Find the first array value in the object (e.g. { suggestions: [...] })
                    const nested = Object.values(qualityItems).find(v => Array.isArray(v));
                    qualityItems = nested || [];
                }
                return qualityItems?.length > 0 ? (
                    <div className="space-y-4">
                        {qualityItems.map((item, index) => (
                            <div key={index} className="p-3 border-l-4 border-[#cca700] bg-[#252526]">
                                <p className="font-semibold text-[#cca700] text-[13px]">Line {item.line}: {item.issue}</p>
                                <p className="text-[#cccccc] mt-1 text-[13px]">{item.suggestion}</p>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-[#969696] text-[13px]">Click "Generate" to analyze code quality and get improvement suggestions.</p>;
            }
            case 'comment':
                 return <p className="text-[#969696] text-[13px]">Click "Generate" to add comments to the code in the editor above.</p>;
            case 'tests':
                return analysis.testCode ? (
                     <pre className="bg-[#1e1e1e] border border-[#3c3c3c] p-4 text-[13px] whitespace-pre-wrap break-all text-[#d4d4d4]"><code>{analysis.testCode}</code></pre>
                ) : <p className="text-[#969696] text-[13px]">Click "Generate" to create unit tests for the current file.</p>;
            default:
                return null;
        }
    };
    
    // Determine if the "Generate" button should be shown for the current tab
    const showGenerateButton = ['mindmap', 'quality', 'comment', 'tests', 'architecture'].includes(activeTab);

    return (
        <div className="h-full w-full flex flex-col bg-[#1e1e1e] overflow-hidden text-[#cccccc]">
            <div className="flex flex-col md:flex-row border-b border-[#333333] flex-shrink-0 justify-between items-start md:items-center pl-2">
                <div className="flex flex-nowrap overflow-x-auto w-full md:w-auto custom-scrollbar gap-2">
                    <TabButton name="workspace" title="Workspace" activeTab={activeTab} onClick={setActiveTab} />
                    <TabButton name="architecture" title="Architecture" activeTab={activeTab} onClick={setActiveTab} />
                    <TabButton name="incident" title="Incident" activeTab={activeTab} onClick={setActiveTab} />
                    <TabButton name="explanation" title="Assistant" activeTab={activeTab} onClick={setActiveTab} />
                    <TabButton name="mindmap" title="Mind Map" activeTab={activeTab} onClick={setActiveTab} />
                    <TabButton name="quality" title="Code Quality" activeTab={activeTab} onClick={setActiveTab} />
                    <TabButton name="comment" title="Auto Comment" activeTab={activeTab} onClick={setActiveTab} />
                    <TabButton name="tests" title="Generate Tests" activeTab={activeTab} onClick={setActiveTab} />
                    <TabButton name="docs" title="Docs" activeTab={activeTab} onClick={setActiveTab} />
                    <TabButton name="debug" title="Debug" activeTab={activeTab} onClick={setActiveTab} />
                    <TabButton name="diff" title="Diff" activeTab={activeTab} onClick={setActiveTab} />
                </div>
                {showGenerateButton && (
                    <div className="p-1 w-full md:w-auto flex justify-end shrink-0 md:pr-4">
                        <button 
                            onClick={() => onGenerate(activeTab)} 
                            disabled={isLoading} 
                            className="text-xs bg-[#007acc] hover:bg-[#005f9e] text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
                        >
                            Generate
                        </button>
                    </div>
                )}
            </div>
            {/* This div is the ONLY scrolling container — content grows inside here, not outside */}
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
                <div className="p-4">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Tabs;
