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
      .style("stroke-width", (d: any) => Math.max(2, d.width)) // Minimum 2px for visibility
      .style("fill", "none")
      .style("cursor", "pointer")
      .style("stroke-opacity", 0.4) // Slightly higher default opacity
      .on("mouseover", function(event, d: any) {
        // Enhanced link hover effects
        d3.select(this)
          .style("stroke-opacity", 0.9)
          .style("stroke-width", (d: any) => Math.max(4, d.width + 2)) // Thicker on hover
        
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `${d.source.name || d.source.id} → ${d.target.name || d.target.id}: ${d.value} calls (${Math.round((d.value / data.links.reduce((sum, l) => sum + l.value, 0)) * 100)}%)`
        })
      })
      .on("mouseout", function(event, d: any) {
        d3.select(this)
          .style("stroke-opacity", 0.4)
          .style("stroke-width", (d: any) => Math.max(2, d.width))
        setTooltip(prev => ({ ...prev, visible: false }))
      })
      .on("click", function(event, d: any) {
        // Optional: Add click functionality for deeper exploration
        console.log(`Clicked link: ${d.source.name} → ${d.target.name}`, d)
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
        // Enhanced node hover with highlight effect
        d3.select(this)
          .style("fill", (d: any) => {
            const originalColor = colorScale(d.id) as string
            return d3.color(originalColor)?.brighter(0.3).toString() || originalColor
          })
          .style("stroke", "#1f2937")
          .style("stroke-width", 2)
        
        const totalValue = d.sourceLinks?.reduce((sum: number, l: any) => sum + l.value, 0) || 
                          d.targetLinks?.reduce((sum: number, l: any) => sum + l.value, 0) || 0
        
        const isSource = d.x0 < width / 2
        const nodeType = isSource ? "Source" : "Caller Type"
        
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `${nodeType}: ${d.name || d.id}\nTotal calls: ${totalValue}\nConnections: ${(d.sourceLinks?.length || 0) + (d.targetLinks?.length || 0)}`
        })
      })
      .on("mouseout", function(event, d: any) {
        d3.select(this)
          .style("fill", (d: any) => colorScale(d.id) as string)
          .style("stroke", "#000")
          .style("stroke-width", 1)
        setTooltip(prev => ({ ...prev, visible: false }))
      })
      .on("click", function(event, d: any) {
        // Optional: Add click functionality for node exploration
        console.log(`Clicked node: ${d.name}`, d)
      })

    // Add node labels - FORCE all nodes to have visible labels
    node.append("text")
      .attr("x", (d: any) => {
        // Position labels outside nodes with more generous spacing
        return d.x0 < width / 2 ? -15 : (d.x1 - d.x0) + 15
      })
      .attr("y", (d: any) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => d.x0 < width / 2 ? "end" : "start")
      .style("font-size", (d: any) => {
        // Ensure minimum font size for visibility - NEVER go below 9px
        const nodeHeight = d.y1 - d.y0
        if (nodeHeight < 15) return "9px"  // Minimum readable size
        if (nodeHeight < 25) return "10px"
        if (nodeHeight < 35) return "11px"
        return "12px"
      })
      .style("font-weight", "600") // Slightly bolder for better visibility
      .style("fill", "#1f2937") // Darker color for better contrast
      .style("pointer-events", "none") // Labels don't interfere with node interactions
      .style("opacity", 1) // Force full opacity
      .text((d: any) => {
        const text = d.name || d.id || 'Unknown'
        const nodeHeight = d.y1 - d.y0
        
        // Aggressive text shortening for very small nodes, but always show SOMETHING
        if (nodeHeight < 15) {
          return text.length > 4 ? text.substring(0, 3) + '.' : text
        } else if (nodeHeight < 25) {
          return text.length > 8 ? text.substring(0, 6) + '..' : text
        } else if (nodeHeight < 35) {
          return text.length > 12 ? text.substring(0, 10) + '..' : text
        } else {
          return text.length > 15 ? text.substring(0, 13) + '..' : text
        }
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
              className="fixed bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-sm font-medium text-gray-900 z-50 pointer-events-none whitespace-pre-line"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translateX(-50%)',
                maxWidth: '250px'
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