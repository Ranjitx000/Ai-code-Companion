import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const D3ArchitectureViewer = ({ data }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!data || !data.nodes || !data.links) return;

        const width = 800;
        const height = 600;

        // Clear previous content
        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;");

        const simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("x", d3.forceX(width / 2).strength(0.1))
            .force("y", d3.forceY(height / 2).strength(0.1));

        // Add arrows
        svg.append("defs").selectAll("marker")
            .data(["end"])
            .enter().append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 25)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("fill", "#666")
            .attr("d", "M0,-5L10,0L0,5");

        const link = svg.append("g")
            .attr("stroke", "#444")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("stroke-width", 1.5)
            .attr("marker-end", "url(#arrow)");

        const node = svg.append("g")
            .attr("stroke", "#000")
            .attr("stroke-width", 1.5)
            .selectAll("g")
            .data(data.nodes)
            .join("g")
            .call(drag(simulation));

        node.append("circle")
            .attr("r", 8)
            .attr("fill", d => d.type === 'module' ? '#4f46e5' : '#10b981')
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);

        node.append("text")
            .attr("x", 12)
            .attr("y", 4)
            .text(d => d.name)
            .attr("font-size", "10px")
            .attr("fill", "#ccc")
            .attr("font-family", "Inter, sans-serif")
            .attr("pointer-events", "none");

        node.append("title")
            .text(d => d.id);

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
        });

        function drag(simulation) {
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        return () => simulation.stop();
    }, [data]);

    return (
        <div className="d3-container w-full bg-[#111] p-4 rounded-xl border border-[#333] shadow-inner mb-6">
            <svg ref={svgRef} className="w-full h-[600px]"></svg>
            <div className="text-[10px] text-gray-500 mt-2 text-center uppercase tracking-widest font-bold">
                Interative Architecture Graph (D3.js) • Drag to explore
            </div>
        </div>
    );
};

export default D3ArchitectureViewer;
