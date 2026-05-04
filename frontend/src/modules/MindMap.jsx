// src/modules/MindMap.jsx
import React, { useRef, useEffect, useCallback } from 'react';
import * as d3 from 'd3';

// Color scheme based on node type
const TYPE_COLORS = {
    root:       { bg: '#7c3aed', border: '#a78bfa', text: '#f5f3ff', icon: '📄' },
    module:     { bg: '#6d28d9', border: '#8b5cf6', text: '#ede9fe', icon: '📦' },
    class:      { bg: '#2563eb', border: '#60a5fa', text: '#eff6ff', icon: '🏗️' },
    function:   { bg: '#059669', border: '#34d399', text: '#ecfdf5', icon: '⚙️' },
    method:     { bg: '#0d9488', border: '#2dd4bf', text: '#f0fdfa', icon: '🔧' },
    variable:   { bg: '#d97706', border: '#fbbf24', text: '#fffbeb', icon: '📌' },
    constant:   { bg: '#dc2626', border: '#f87171', text: '#fef2f2', icon: '🔒' },
    import:     { bg: '#7c3aed', border: '#a78bfa', text: '#f5f3ff', icon: '🔗' },
    export:     { bg: '#db2777', border: '#f472b6', text: '#fdf2f8', icon: '📤' },
    hook:       { bg: '#0891b2', border: '#22d3ee', text: '#ecfeff', icon: '🪝' },
    state:      { bg: '#4f46e5', border: '#818cf8', text: '#eef2ff', icon: '💾' },
    effect:     { bg: '#7e22ce', border: '#c084fc', text: '#faf5ff', icon: '⚡' },
    component:  { bg: '#0284c7', border: '#38bdf8', text: '#f0f9ff', icon: '🧩' },
    interface:  { bg: '#6366f1', border: '#a5b4fc', text: '#eef2ff', icon: '📋' },
    type:       { bg: '#8b5cf6', border: '#c4b5fd', text: '#f5f3ff', icon: '🏷️' },
    property:   { bg: '#ea580c', border: '#fb923c', text: '#fff7ed', icon: '🔑' },
    parameter:  { bg: '#ca8a04', border: '#facc15', text: '#fefce8', icon: '📥' },
    default:    { bg: '#475569', border: '#94a3b8', text: '#f8fafc', icon: '•' },
};

const getTypeStyle = (type) => {
    if (!type) return TYPE_COLORS.default;
    const key = type.toLowerCase();
    return TYPE_COLORS[key] || TYPE_COLORS.default;
};

const drawChart = (svgEl, data, width, height) => {
    if (!data || width === 0 || height === 0) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    // Create defs for gradients and filters
    const defs = svg.append('defs');

    // Glow filter for hover effect
    const glowFilter = defs.append('filter')
        .attr('id', 'glow')
        .attr('x', '-50%').attr('y', '-50%')
        .attr('width', '200%').attr('height', '200%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    glowFilter.append('feMerge')
        .selectAll('feMergeNode')
        .data(['blur', 'SourceGraphic'])
        .enter().append('feMergeNode')
        .attr('in', d => d);

    // Shadow filter for nodes
    const shadowFilter = defs.append('filter')
        .attr('id', 'node-shadow')
        .attr('x', '-30%').attr('y', '-30%')
        .attr('width', '160%').attr('height', '160%');
    shadowFilter.append('feDropShadow')
        .attr('dx', '0').attr('dy', '2')
        .attr('stdDeviation', '4')
        .attr('flood-color', 'rgba(0,0,0,0.4)');

    // Build tree
    const root = d3.hierarchy(data);
    const nodeCount = root.descendants().length;
    const treeHeight = Math.max(nodeCount * 45, 300);
    const treeWidth = Math.max(root.height * 220, 400);

    const treeLayout = d3.tree()
        .size([treeHeight, treeWidth])
        .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.8));
    treeLayout(root);

    // Container group with zoom
    const container = svg.append('g');

    const zoom = d3.zoom()
        .scaleExtent([0.2, 3])
        .on('zoom', (event) => {
            container.attr('transform', event.transform);
        });

    svg.call(zoom);

    // Compute actual bounding box of all nodes after layout
    const allNodes = root.descendants();
    const minX = d3.min(allNodes, d => d.x);
    const maxX = d3.max(allNodes, d => d.x);
    const minY = d3.min(allNodes, d => d.y);
    const maxY = d3.max(allNodes, d => d.y);

    const treeBoundsW = maxY - minY;
    const treeBoundsH = maxX - minX;

    // Calculate scale to fit, with some padding
    const padding = 100;
    const scaleX = (width - padding * 2) / (treeBoundsW + 200);
    const scaleY = (height - padding * 2) / (treeBoundsH + 60);
    const fitScale = Math.min(scaleX, scaleY, 1.0); // don't scale above 1x

    // Center position
    const centerX = (width - (treeBoundsW + 200) * fitScale) / 2 - minY * fitScale + 100 * fitScale;
    const centerY = (height - (treeBoundsH + 60) * fitScale) / 2 - minX * fitScale + 30 * fitScale;

    svg.call(zoom.transform, d3.zoomIdentity.translate(centerX, centerY).scale(fitScale));

    // --- Draw Links ---
    const linkGenerator = d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x);

    // Link gradient for each link
    root.links().forEach((link, i) => {
        const sourceStyle = getTypeStyle(link.source.data.type);
        const targetStyle = getTypeStyle(link.target.data.type);
        const grad = defs.append('linearGradient')
            .attr('id', `link-grad-${i}`)
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', link.source.y).attr('y1', link.source.x)
            .attr('x2', link.target.y).attr('y2', link.target.x);
        grad.append('stop').attr('offset', '0%').attr('stop-color', sourceStyle.border).attr('stop-opacity', 0.6);
        grad.append('stop').attr('offset', '100%').attr('stop-color', targetStyle.border).attr('stop-opacity', 0.6);
    });

    container.selectAll('path.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', linkGenerator)
        .attr('fill', 'none')
        .attr('stroke', (d, i) => `url(#link-grad-${i})`)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', function() { return this.getTotalLength(); })
        .attr('stroke-dashoffset', function() { return this.getTotalLength(); })
        .transition()
        .duration(800)
        .delay((d, i) => i * 30)
        .attr('stroke-dashoffset', 0);

    // --- Draw Nodes ---
    const node = container.selectAll('g.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.y},${d.x})`)
        .style('opacity', 0);

    // Animate nodes in
    node.transition()
        .duration(500)
        .delay((d, i) => 200 + i * 40)
        .style('opacity', 1);

    // Connector dot on left side of node
    node.append('circle')
        .attr('r', 3)
        .attr('cx', d => {
            const label = `${getTypeStyle(d.data.type).icon} ${d.data.name}`;
            return -(label.length * 3.8 + 16);
        })
        .attr('fill', d => getTypeStyle(d.data.type).border)
        .attr('opacity', 0.6);

    // Node pill background
    node.each(function(d) {
        const style = getTypeStyle(d.data.type);
        const label = `${style.icon} ${d.data.name}`;
        const textWidth = Math.max(label.length * 7.5, 60);
        const pillWidth = textWidth + 24;
        const pillHeight = 28;
        const isRoot = d.depth === 0;

        const g = d3.select(this);

        // Pill background
        g.append('rect')
            .attr('x', -pillWidth / 2)
            .attr('y', -pillHeight / 2)
            .attr('width', pillWidth)
            .attr('height', pillHeight)
            .attr('rx', isRoot ? 8 : 14)
            .attr('ry', isRoot ? 8 : 14)
            .attr('fill', style.bg)
            .attr('stroke', style.border)
            .attr('stroke-width', isRoot ? 2 : 1.5)
            .attr('filter', 'url(#node-shadow)')
            .attr('opacity', isRoot ? 1 : 0.9);

        // Inner highlight (subtle gradient feel)
        g.append('rect')
            .attr('x', -pillWidth / 2 + 1)
            .attr('y', -pillHeight / 2 + 1)
            .attr('width', pillWidth - 2)
            .attr('height', pillHeight / 2 - 1)
            .attr('rx', isRoot ? 7 : 13)
            .attr('ry', isRoot ? 7 : 13)
            .attr('fill', 'rgba(255,255,255,0.08)');

        // Label text
        g.append('text')
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('fill', style.text)
            .attr('font-size', isRoot ? '13px' : '11.5px')
            .attr('font-weight', isRoot ? '700' : '500')
            .attr('font-family', "'Inter', 'Segoe UI', system-ui, sans-serif")
            .text(label);

        // Children count badge
        if (d.children && d.children.length > 0) {
            const badgeX = pillWidth / 2 - 4;
            const badgeY = -pillHeight / 2 - 4;
            g.append('circle')
                .attr('cx', badgeX)
                .attr('cy', badgeY)
                .attr('r', 8)
                .attr('fill', '#1e1b4b')
                .attr('stroke', style.border)
                .attr('stroke-width', 1.5);
            g.append('text')
                .attr('x', badgeX)
                .attr('y', badgeY)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .attr('fill', style.border)
                .attr('font-size', '9px')
                .attr('font-weight', '700')
                .text(d.children.length);
        }

        // Type badge below node
        if (d.data.type && d.depth > 0) {
            g.append('text')
                .attr('dy', pillHeight / 2 + 14)
                .attr('text-anchor', 'middle')
                .attr('fill', style.border)
                .attr('font-size', '9px')
                .attr('font-weight', '600')
                .attr('opacity', 0.7)
                .attr('text-transform', 'uppercase')
                .text(d.data.type.toUpperCase());
        }

        // Hover interactions
        g.on('mouseover', function() {
            d3.select(this).select('rect')
                .transition().duration(200)
                .attr('filter', 'url(#glow)')
                .attr('stroke-width', 2.5)
                .attr('opacity', 1);
            d3.select(this).raise();
        })
        .on('mouseout', function() {
            d3.select(this).select('rect')
                .transition().duration(300)
                .attr('filter', 'url(#node-shadow)')
                .attr('stroke-width', isRoot ? 2 : 1.5)
                .attr('opacity', isRoot ? 1 : 0.9);
        });
    });
};

const MindMap = ({ data }) => {
    const svgRef = useRef();
    const containerRef = useRef();

    useEffect(() => {
        const container = containerRef.current;
        if (!data || !container) return;

        const svg = d3.select(svgRef.current);

        const observer = new ResizeObserver(entries => {
            const entry = entries[0];
            const { width, height } = entry.contentRect;
            svg.attr('width', width).attr('height', height);
            drawChart(svgRef.current, data, width, height);
        });

        observer.observe(container);
        return () => observer.disconnect();
    }, [data]);

    return (
        <div ref={containerRef} className="mindmap-container">
            <svg ref={svgRef}></svg>
            <div className="mindmap-controls">
                <span className="mindmap-hint">🖱️ Scroll to zoom · Drag to pan</span>
            </div>
        </div>
    );
};

export default MindMap;