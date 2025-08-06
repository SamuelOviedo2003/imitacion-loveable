"use client"

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal, SankeyGraph, SankeyNode, SankeyLink } from 'd3-sankey'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SankeyData } from '@/hooks/useIncomingCallsData'
import { Info } from 'lucide-react'

interface SourceToCallerTypeSankeyProps {
  data: SankeyData
  loading: boolean
}

export default function SourceToCallerTypeSankey({ data, loading }: SourceToCallerTypeSankeyProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    content: string
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: ''
  })
  
  const [infoTooltip, setInfoTooltip] = useState<{
    visible: boolean
    x: number
    y: number
  }>({
    visible: false,
    x: 0,
    y: 0
  })

  useEffect(() => {
    if (!data.nodes.length || !data.links.length || loading) return

    // Clear everything and start fresh
    const svgElement = svgRef.current
    if (svgElement) {
      svgElement.innerHTML = ''
    }

    const svg = d3.select(svgRef.current)
    const containerWidth = 1000
    const containerHeight = 500
    const margin = { top: 40, right: 200, bottom: 40, left: 200 }
    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom

    svg
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .style("background", "transparent")

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Create color scale
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1']
    const colorScale = d3.scaleOrdinal()
      .domain(data.nodes.map(d => d.id))
      .range(colors)

    // Setup sankey
    const sankeyGenerator = sankey<{}, {}>()
      .nodeId((d: any) => d.id)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[0, 0], [width, height]])

    const sankeyData: SankeyGraph<{}, {}> = {
      nodes: data.nodes.map(d => ({ ...d } as any)),
      links: data.links.map(d => ({ ...d } as any))
    }

    const graph = sankeyGenerator(sankeyData)

    // Draw links
    g.selectAll(".link")
      .data(graph.links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", sankeyLinkHorizontal())
      .style("stroke", (d: any) => colorScale(d.source.id) as string)
      .style("stroke-opacity", 0.6)
      .style("stroke-width", (d: any) => Math.max(1, d.width))
      .style("fill", "none")
      .style("cursor", "pointer")
      .on("mouseover", function(event, d: any) {
        // Highlight hovered link
        d3.select(this)
          .style("stroke-opacity", 0.9)
          .style("stroke-width", (d: any) => Math.max(3, d.width + 2))
        
        // Dim other links
        g.selectAll(".link")
          .filter((otherD: any) => otherD !== d)
          .style("stroke-opacity", 0.2)
        
        // Show tooltip
        const totalCalls = data.links.reduce((sum, l) => sum + l.value, 0)
        const percentage = Math.round((d.value / totalCalls) * 100)
        
        setTooltip({
          visible: true,
          x: event.pageX,
          y: event.pageY - 40,
          content: `${d.source.name || d.source.id} → ${d.target.name || d.target.id}\n${d.value} calls (${percentage}%)`
        })
      })
      .on("mouseout", function() {
        // Reset all links
        g.selectAll(".link")
          .style("stroke-opacity", 0.6)
          .style("stroke-width", (d: any) => Math.max(1, d.width))
        
        setTooltip(prev => ({ ...prev, visible: false }))
      })

    // Draw nodes
    g.selectAll(".node")
      .data(graph.nodes)
      .enter()
      .append("rect")
      .attr("class", "node")
      .attr("x", (d: any) => d.x0)
      .attr("y", (d: any) => d.y0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("width", (d: any) => d.x1 - d.x0)
      .style("fill", (d: any) => colorScale(d.id) as string)
      .style("stroke", "#333")
      .style("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d: any) {
        // Highlight node
        d3.select(this)
          .style("fill", (d: any) => d3.color(colorScale(d.id) as string)?.brighter(0.3).toString() || colorScale(d.id) as string)
        
        // Highlight connected links
        const connectedLinks = [...(d.sourceLinks || []), ...(d.targetLinks || [])]
        g.selectAll(".link")
          .style("stroke-opacity", (linkD: any) => {
            return connectedLinks.includes(linkD) ? 0.9 : 0.2
          })
        
        // Show tooltip
        const totalValue = (d.sourceLinks?.reduce((sum: number, l: any) => sum + l.value, 0) || 0) +
                          (d.targetLinks?.reduce((sum: number, l: any) => sum + l.value, 0) || 0)
        
        setTooltip({
          visible: true,
          x: event.pageX,
          y: event.pageY - 40,
          content: `${d.name || d.id}\nTotal calls: ${totalValue}`
        })
      })
      .on("mouseout", function(event, d: any) {
        // Reset node
        d3.select(this)
          .style("fill", (d: any) => colorScale(d.id) as string)
        
        // Reset links
        g.selectAll(".link")
          .style("stroke-opacity", 0.6)
        
        setTooltip(prev => ({ ...prev, visible: false }))
      })

    // Add labels
    g.selectAll(".label")
      .data(graph.nodes)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d: any) => {
        // Position labels outside nodes
        return d.x0 < width / 2 ? d.x0 - 10 : d.x1 + 10
      })
      .attr("y", (d: any) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => d.x0 < width / 2 ? "end" : "start")
      .style("font-size", "11px")
      .style("font-weight", "500")
      .style("fill", "#374151")
      .style("pointer-events", "none")
      .style("user-select", "none")
      .text((d: any) => {
        const text = d.name || d.id || 'Unknown'
        return text.length > 20 ? text.substring(0, 18) + '..' : text
      })

  }, [data, loading])

  if (loading) {
    return (
      <div className="modern-card pastel-card-lavender">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-2xl font-bold text-gray-900">Source to Caller Type Flow</h3>
            <div className="relative cursor-help p-1 rounded-xl hover:bg-white/50 transition-colors">
              <Info className="h-5 w-5 text-gray-500" />
            </div>
          </div>
          <p className="text-gray-600">Interactive flow visualization of call sources and caller types</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-purple-100/50 p-8">
          <div className="flex items-center justify-center h-[500px]">
            <div className="animate-pulse text-gray-500 text-lg font-medium">Loading diagram...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!data.nodes.length || !data.links.length) {
    return (
      <div className="modern-card pastel-card-lavender">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-2xl font-bold text-gray-900">Source to Caller Type Flow</h3>
            <div className="relative cursor-help p-1 rounded-xl hover:bg-white/50 transition-colors">
              <Info className="h-5 w-5 text-gray-500" />
            </div>
          </div>
          <p className="text-gray-600">Interactive flow visualization of call sources and caller types</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-purple-100/50 p-8">
          <div className="flex items-center justify-center h-[500px]">
            <div className="text-gray-500 text-lg font-medium">No relationship data available</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modern-card pastel-card-lavender">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-2xl font-bold text-gray-900">Source to Caller Type Flow</h3>
          <div 
            className="relative cursor-help p-1 rounded-xl hover:bg-white/50 transition-colors"
            onMouseEnter={(e) => {
              setInfoTooltip({
                visible: true,
                x: e.pageX,
                y: e.pageY - 40
              })
            }}
            onMouseLeave={() => {
              setInfoTooltip(prev => ({ ...prev, visible: false }))
            }}
            onMouseMove={(e) => {
              if (infoTooltip.visible) {
                setInfoTooltip(prev => ({
                  ...prev,
                  x: e.pageX,
                  y: e.pageY - 40
                }))
              }
            }}
          >
            <Info className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
          </div>
        </div>
        <p className="text-gray-600">Interactive flow visualization of call sources and caller types</p>
      </div>
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-purple-100/50 p-8">
        <div className="flex justify-center w-full">
          <svg 
            ref={svgRef}
            style={{ 
              userSelect: 'none',
              cursor: 'default'
            }}
          />
        </div>
        
        {/* Hover tooltip */}
        {tooltip.visible && (
          <div
            className="fixed bg-gray-900 text-white p-3 border border-gray-700 rounded-lg shadow-xl text-sm font-medium z-50 pointer-events-none whitespace-pre-line"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translateX(-50%)',
              maxWidth: '300px'
            }}
          >
            {tooltip.content}
          </div>
        )}
        
        {/* Info tooltip */}
        {infoTooltip.visible && (
          <div
            className="fixed bg-gray-900 text-white p-3 border border-gray-700 rounded-lg shadow-xl text-sm font-medium z-50 pointer-events-none"
            style={{
              left: `${infoTooltip.x}px`,
              top: `${infoTooltip.y}px`,
              transform: 'translateX(-50%)',
              maxWidth: '320px'
            }}
          >
            This interactive diagram shows the relationship between call sources (left) and caller types (right). 
            The width of each flow represents the number of calls. Hover over nodes and links for detailed information.
          </div>
        )}
      </div>
    </div>
  )
}