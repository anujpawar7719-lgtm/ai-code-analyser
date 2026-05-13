import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const CodeMap = ({ data }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!data || !data.nodes || data.nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Clean up previous SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const g = svg.append('g');

    // Zoom setup
    svg.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      }));

    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => Math.sqrt(d.loc || 10) + 10));

    // Links
    const link = g.append('g')
      .attr('stroke', '#00d4ff')
      .attr('stroke-opacity', 0.3)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5);

    // Nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => Math.sqrt(d.loc || 10) + 2)
      .attr('fill', d => {
        if (d.isHotspot) return '#ef4444';
        if (d.isEntryPoint) return '#00d4ff';
        return '#475569';
      })
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .attr('class', d => d.isHotspot ? 'node-pulse' : '')
      .call(drag(simulation));

    // Tooltip simulation
    node.append('title')
      .text(d => `${d.label}\nLOC: ${d.loc}\nComplexity: ${d.complexity}`);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
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
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    return () => simulation.stop();
  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] card overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Dependency Map</h3>
      </div>
      <svg ref={svgRef} className="cursor-move" />
      <div className="absolute bottom-4 right-4 flex gap-4 text-xs font-mono">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-danger" /> <span>Hotspot</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary" /> <span>Entry Point</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-500" /> <span>File</span>
        </div>
      </div>
    </div>
  );
};

export default CodeMap;
