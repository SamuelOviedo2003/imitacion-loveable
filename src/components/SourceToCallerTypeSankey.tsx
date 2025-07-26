"use client"

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal, SankeyGraph, SankeyNode, SankeyLink } from 'd3-sankey'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SankeyData } from '@/hooks/useIncomingCallsData'

interface SourceToCallerTypeSankeyProps {
  data: SankeyData
  loading: boolean
}

interface D3SankeyNode extends SankeyNode<{}, {}> {
  id?: string
  name?: string
  x0?: number
  x1?: number
  y0?: number
  y1?: number
}

interface D3SankeyLink extends SankeyLink<{}, {}> {
  source: any
  target: any
  value: number
  y0?: number
  y1?: number
  width?: number
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

  useEffect(() => {
    if (!data.nodes.length || !data.links.length || loading) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 30, right: 120, bottom: 30, left: 120 }
    const width = 800 - margin.left - margin.right
    const height = 450 - margin.top - margin.bottom

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Create color scale
    const colorScale = d3.scaleOrdinal()
      .domain(data.nodes.map(d => d.id))
      .range([
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
      ])

    // Prepare data for d3-sankey
    const sankeyData: SankeyGraph<{}, {}> = {
      nodes: data.nodes.map(d => ({ ...d } as any)),
      links: data.links.map(d => ({ ...d } as any))
    }

    // Create sankey layout
    const sankeyLayout = sankey<{}, {}>()
      .nodeId((d: any) => d.id)
      .nodeWidth(20)
      .nodePadding(15)
      .extent([[0, 0], [width, height]])

    const graph = sankeyLayout(sankeyData)

    // Draw links
    const link = g.append("g")
      .selectAll(".link")
      .data(graph.links)
      .enter().append("path")
      .attr("class", "link")
      .attr("d", sankeyLinkHorizontal())
      .style("stroke", (d: any) => {
        const sourceColor = colorScale(d.source.id) as string
        return d3.color(sourceColor)?.copy({ opacity: 0.3 }).toString() || '#ddd'
      })
      .style("stroke-width", (d: any) => Math.max(1, d.width))
      .style("fill", "none")
      .style("cursor", "pointer")
      .on("mouseover", function(event, d: any) {
        d3.select(this).style("stroke-opacity", 0.8)
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `${d.source.name} → ${d.target.name}: ${d.value} calls`
        })
      })
      .on("mouseout", function(event, d: any) {
        d3.select(this).style("stroke-opacity", 0.3)
        setTooltip(prev => ({ ...prev, visible: false }))
      })

    // Draw nodes
    const node = g.append("g")
      .selectAll(".node")
      .data(graph.nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`)

    // Add node rectangles
    node.append("rect")
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("width", (d: any) => d.x1 - d.x0)
      .style("fill", (d: any) => colorScale(d.id) as string)
      .style("stroke", "#000")
      .style("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d: any) {
        const totalValue = d.sourceLinks?.reduce((sum: number, l: any) => sum + l.value, 0) || 
                          d.targetLinks?.reduce((sum: number, l: any) => sum + l.value, 0) || 0
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `${d.name}: ${totalValue} calls`
        })
      })
      .on("mouseout", function() {
        setTooltip(prev => ({ ...prev, visible: false }))
      })

    // Add node labels outside the rectangles - ensure all nodes get labels
    node.append("text")
      .attr("x", (d: any) => d.x0 < width / 2 ? -10 : (d.x1 - d.x0) + 10)
      .attr("y", (d: any) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => d.x0 < width / 2 ? "end" : "start")
      .style("font-size", (d: any) => {
        // Scale font size based on node height, but ensure minimum readability
        const nodeHeight = d.y1 - d.y0
        if (nodeHeight < 20) return "10px"
        if (nodeHeight < 30) return "11px"
        return "13px"
      })
      .style("font-weight", "500")
      .style("fill", "#374151")
      .style("pointer-events", "none")
      .each(function(d: any) {
        const text = d.name || d.id
        const element = d3.select(this)
        
        // For smaller nodes, use shorter text
        const nodeHeight = d.y1 - d.y0
        let displayText = text
        
        if (nodeHeight < 20 && text.length > 8) {
          displayText = text.substring(0, 6) + '...'
        } else if (nodeHeight < 30 && text.length > 12) {
          displayText = text.substring(0, 10) + '...'
        } else if (text.length > 15) {
          displayText = text.substring(0, 13) + '...'
        }
        
        element.text(displayText)
      })

  }, [data, loading])

  if (loading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Source to Caller Type Relationship</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[500px]">
            <div className="animate-pulse text-gray-500">Loading diagram...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data.nodes.length || !data.links.length) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Source to Caller Type Relationship</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[500px]">
            <div className="text-gray-500">No relationship data available</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900">Source to Caller Type Relationship</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-x-auto flex justify-center">
          <svg ref={svgRef} />
          {tooltip.visible && (
            <div
              className="fixed bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-sm font-medium text-gray-900 z-50 pointer-events-none"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translateX(-50%)'
              }}
            >
              {tooltip.content}
            </div>
          )}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>This diagram shows the relationship between call sources (left) and caller types (right). 
          The width of each flow represents the number of calls.</p>
        </div>
      </CardContent>
    </Card>
  )
}