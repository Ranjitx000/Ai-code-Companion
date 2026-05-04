import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import D3ArchitectureViewer from './D3ArchitectureViewer';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
    }
});

const MermaidChart = ({ code, index }) => {
    const chartRef = useRef(null);
    const [svg, setSvg] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const renderChart = async () => {
            if (!chartRef.current) return;
            try {
                // Unique ID for each chart to avoid collisions
                const id = `mermaid-chart-${index}-${Date.now()}`;
                const { svg } = await mermaid.render(id, code);
                setSvg(svg);
                setError(null);
            } catch (err) {
                console.error('Mermaid render error:', err);
                setError(err.message);
            }
        };
        renderChart();
    }, [code, index]);

    if (error) {
        return (
            <div className="text-red-400 p-4 border border-red-500 bg-red-900/30 rounded-md my-4 text-xs font-mono">
                Failed to render diagram: {error}
            </div>
        );
    }

    return (
        <div 
            ref={chartRef}
            className="mermaid-container w-full overflow-auto bg-[#1a1a1a] p-6 rounded-lg border border-[#333] flex justify-center my-6 shadow-xl"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
};

const ArchitectureViewer = ({ data }) => {
    if (!data) return null;

    // Split the content into parts: text, mermaid blocks, and d3 blocks
    const parts = data.split(/(```mermaid\n[\s\S]*?\n```|```json\n[\s\S]*?\n```)/g);

    return (
        <div className="flex flex-col gap-2 p-1">
            {parts.map((part, index) => {
                const isMermaid = part.startsWith('```mermaid');
                const isJSON = part.startsWith('```json');
                
                if (isMermaid) {
                    const code = part.replace(/```mermaid\n/, '').replace(/\n```$/, '');
                    return <MermaidChart key={index} code={code} index={index} />;
                } else if (isJSON) {
                    try {
                        const code = part.replace(/```json\n/, '').replace(/\n```$/, '');
                        const jsonData = JSON.parse(code);
                        if (jsonData.type === 'd3-force') {
                            return <D3ArchitectureViewer key={index} data={jsonData} />;
                        }
                        // If not d3-force, just render as code block
                        return (
                            <pre key={index} className="bg-black/40 p-4 rounded-md font-mono text-[10px] border border-white/10 overflow-auto">
                                <code>{code}</code>
                            </pre>
                        );
                    } catch (e) {
                        return null;
                    }
                } else {
                    return (
                        <div 
                            key={index}
                            className="ai-markdown-output prose prose-invert prose-sm max-w-none text-[#cccccc] leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(part)) }}
                        />
                    );
                }
            })}
        </div>
    );
};

export default ArchitectureViewer;
