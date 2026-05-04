import React, { useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// ─── Language detection from file extension ───────────────────────────────────
const EXT_MAP = {
    js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
    py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java',
    c: 'c', cpp: 'cpp', cs: 'csharp', php: 'php', swift: 'swift',
    kt: 'kotlin', scala: 'scala', sh: 'bash', bash: 'bash', zsh: 'bash',
    html: 'html', htm: 'html', css: 'css', scss: 'scss', less: 'less',
    json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml',
    md: 'markdown', mdx: 'markdown', sql: 'sql', graphql: 'graphql',
    xml: 'xml', svg: 'xml', dockerfile: 'docker', tf: 'hcl',
    vue: 'javascript', svelte: 'javascript', r: 'r', dart: 'dart',
    lua: 'lua', ex: 'elixir', exs: 'elixir', erl: 'erlang',
};

function detectLanguage(filePath = '') {
    const ext = filePath.split('.').pop()?.toLowerCase();
    return EXT_MAP[ext] || 'text';
}

// ─── Shared scrollbar style ───────────────────────────────────────────────────
const SCROLLBAR_STYLE = {
    scrollbarWidth: 'thin',
    scrollbarColor: '#3e3e42 transparent',
};

// ─── Component ────────────────────────────────────────────────────────────────
const CodeViewer = React.forwardRef(({ file, editedContent, onContentChange, onDownload }, ref) => {
    const scrollRef = useRef(null);
    const textareaRef = useRef(null);

    // Keep textarea and highlight layer scrolled together
    const handleScroll = () => {
        if (!scrollRef.current || !textareaRef.current) return;
        textareaRef.current.scrollTop  = scrollRef.current.scrollTop;
        textareaRef.current.scrollLeft = scrollRef.current.scrollLeft;
    };

    const handleTextareaScroll = () => {
        if (!scrollRef.current || !textareaRef.current) return;
        scrollRef.current.scrollTop  = textareaRef.current.scrollTop;
        scrollRef.current.scrollLeft = textareaRef.current.scrollLeft;
    };

    // ── Empty state ────────────────────────────────────────────────────────────
    if (!file) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-500 h-full gap-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
                    className="opacity-30" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                </svg>
                <p className="text-[13px]">Select a file to begin analysis.</p>
            </div>
        );
    }

    const language = detectLanguage(file.path);
    const fileName = file.path.split('/').pop();
    const dirPath  = file.path.split('/').slice(0, -1).join('/') || 'src';

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e]" ref={ref}>

            {/* ── Breadcrumb header ─────────────────────────────────────────── */}
            <div className="flex justify-between items-center px-4 py-1 bg-[#1e1e1e] border-b border-[#2b2b2b] flex-shrink-0">
                <div className="flex items-center text-[#cccccc] text-[13px] overflow-x-auto whitespace-nowrap pr-2 min-w-0">
                    <span className="opacity-70 hover:opacity-100 cursor-pointer shrink-0">Companion</span>
                    <span className="mx-2 opacity-50 shrink-0">{'>'}</span>
                    <span className="opacity-70 hover:opacity-100 cursor-pointer shrink-0 truncate">{dirPath}</span>
                    {file.path.includes('/') && <span className="mx-2 opacity-50 shrink-0">{'>'}</span>}
                    <span className="text-[#e7e7e7] font-medium shrink-0">{fileName}</span>
                    <span className="ml-3 text-[#569cd6] text-[11px] opacity-60 shrink-0">{language}</span>
                </div>

                {/* Download button */}
                <button
                    onClick={onDownload}
                    className="p-1 hover:bg-[#3c3c3c] rounded text-[#cccccc] transition-colors flex-shrink-0"
                    title="Download File"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>
            </div>

            {/* ── Editor area: highlighted layer + transparent textarea overlay ── */}
            <div className="relative flex-1 overflow-hidden">

                {/* Syntax-highlighted display (scrollable, pointer-events off) */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="absolute inset-0 overflow-auto"
                    style={SCROLLBAR_STYLE}
                >
                    <SyntaxHighlighter
                        language={language}
                        style={vscDarkPlus}
                        showLineNumbers={true}
                        wrapLines={false}
                        lineNumberStyle={{
                            minWidth:   '3em',
                            paddingRight: '1.5em',
                            color:      '#858585',
                            userSelect: 'none',
                            fontSize:   '13px',
                        }}
                        customStyle={{
                            margin:     0,
                            padding:    '16px 0',
                            background: '#1e1e1e',
                            fontSize:   '13px',
                            lineHeight: '1.6',
                            minHeight:  '100%',
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                            pointerEvents: 'none',   // let clicks fall through to textarea
                            userSelect: 'none',
                        }}
                        codeTagProps={{ style: { fontFamily: 'inherit' } }}
                    >
                        {editedContent || ''}
                    </SyntaxHighlighter>
                </div>

                {/* Transparent editable textarea on top */}
                <textarea
                    ref={textareaRef}
                    value={editedContent}
                    onChange={(e) => onContentChange(e.target.value)}
                    onScroll={handleTextareaScroll}
                    spellCheck="false"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    className="absolute inset-0 w-full h-full resize-none border-none focus:outline-none"
                    style={{
                        // Make the textarea invisible but editable
                        background:  'transparent',
                        color:       'transparent',
                        caretColor:  '#aeafad',        // visible caret
                        fontFamily:  "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                        fontSize:    '13px',
                        lineHeight:  '1.6',
                        padding:     '16px 16px 16px 62px', // align with line-number gutter
                        whiteSpace:  'pre',
                        overflowWrap:'normal',
                        overflow:    'auto',
                        zIndex:      2,
                        ...SCROLLBAR_STYLE,
                    }}
                />
            </div>

            {/* ── Status bar ────────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 px-4 py-0.5 bg-[#007acc] text-white text-[11px] flex-shrink-0 select-none">
                <span>{language.toUpperCase()}</span>
                <span className="opacity-60">|</span>
                <span>{(editedContent || '').split('\n').length} lines</span>
                <span className="opacity-60">|</span>
                <span>UTF-8</span>
            </div>
        </div>
    );
});

CodeViewer.displayName = 'CodeViewer';
export default CodeViewer;