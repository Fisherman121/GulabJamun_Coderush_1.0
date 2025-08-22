"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts"
import Link from "next/link"

// Market heatmap data
const heatmapData = [
  { symbol: "RELIANCE", change: 2.45, volume: 1250000, sector: "Energy", price: 2456.75 },
  { symbol: "TCS", change: -1.23, volume: 890000, sector: "IT", price: 3234.5 },
  { symbol: "HDFC", change: 3.67, volume: 2100000, sector: "Banking", price: 1567.25 },
  { symbol: "INFY", change: -0.89, volume: 1450000, sector: "IT", price: 1456.8 },
  { symbol: "ICICIBANK", change: 1.98, volume: 1800000, sector: "Banking", price: 987.45 },
  { symbol: "BHARTIARTL", change: -2.34, volume: 950000, sector: "Telecom", price: 876.3 },
  { symbol: "ITC", change: 0.45, volume: 1100000, sector: "FMCG", price: 456.75 },
  { symbol: "SBIN", change: 4.12, volume: 2300000, sector: "Banking", price: 567.9 },
  { symbol: "LT", change: -1.56, volume: 780000, sector: "Infrastructure", price: 2345.6 },
  { symbol: "HCLTECH", change: 2.78, volume: 1200000, sector: "IT", price: 1234.45 },
  { symbol: "WIPRO", change: -0.67, volume: 890000, sector: "IT", price: 567.8 },
  { symbol: "MARUTI", change: 1.89, volume: 650000, sector: "Auto", price: 8765.4 },
  { symbol: "BAJFINANCE", change: 3.45, volume: 1400000, sector: "NBFC", price: 6789.25 },
  { symbol: "ASIANPAINT", change: -1.12, volume: 450000, sector: "Paints", price: 3456.7 },
  { symbol: "NESTLEIND", change: 0.78, volume: 320000, sector: "FMCG", price: 18765.5 },
  { symbol: "KOTAKBANK", change: 2.34, volume: 1600000, sector: "Banking", price: 1876.45 },
]

// Sector performance data
const sectorData = [
  { sector: "Banking", performance: 2.45, stocks: 12 },
  { sector: "IT", performance: -0.67, stocks: 8 },
  { sector: "Energy", performance: 1.89, stocks: 6 },
  { sector: "Auto", performance: 0.45, stocks: 5 },
  { sector: "FMCG", performance: 1.23, stocks: 7 },
  { sector: "Pharma", performance: -1.45, stocks: 9 },
]

// Market breadth data
const breadthData = [
  { time: "09:15", advances: 1250, declines: 890, unchanged: 160 },
  { time: "10:00", advances: 1340, declines: 820, unchanged: 140 },
  { time: "11:00", advances: 1420, declines: 750, unchanged: 130 },
  { time: "12:00", advances: 1380, declines: 780, unchanged: 140 },
  { time: "13:00", advances: 1450, declines: 720, unchanged: 130 },
  { time: "14:00", advances: 1520, declines: 650, unchanged: 130 },
  { time: "15:00", advances: 1480, declines: 680, unchanged: 140 },
]

export default function MarketOverview() {
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [marketTime, setMarketTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setMarketTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getHeatmapColor = (change: number) => {
    if (change > 2) return "bg-emerald-500"
    if (change > 0) return "bg-emerald-400"
    if (change > -2) return "bg-red-400"
    return "bg-red-500"
  }

  const getHeatmapSize = (volume: number) => {
    const maxVolume = Math.max(...heatmapData.map((d) => d.volume))
    const ratio = volume / maxVolume
    return Math.max(60, ratio * 120)
  }

  const filteredHeatmap = selectedSector ? heatmapData.filter((stock) => stock.sector === selectedSector) : heatmapData

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-bold text-teal-400">
              HFT Pro
            </Link>
            <nav className="flex gap-4">
              <Link href="/" className="text-slate-400 hover:text-teal-400 transition-colors">
                Dashboard
              </Link>
              <span className="text-teal-400 font-medium">Market Overview</span>
              <Link href="/charts" className="text-slate-400 hover:text-teal-400 transition-colors">
                Charts
              </Link>
              <Link href="/portfolio" className="text-slate-400 hover:text-teal-400 transition-colors">
                Portfolio
              </Link>
              <Link href="/options" className="text-slate-400 hover:text-teal-400 transition-colors">
                Options
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-emerald-500 text-emerald-400">
              Market Open
            </Badge>
            <span className="text-sm text-slate-400">{marketTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Market Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">NIFTY 50</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">19,674.25</div>
              <div className="text-sm text-emerald-400">+234.50 (+1.21%)</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">SENSEX</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">65,953.48</div>
              <div className="text-sm text-emerald-400">+789.23 (+1.21%)</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">2.45B</div>
              <div className="text-sm text-slate-400">Shares traded</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Advances/Declines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">1520/680</div>
              <div className="text-sm text-slate-400">A/D Ratio: 2.24</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Heatmap */}
          <Card className="lg:col-span-2 bg-slate-900/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-teal-400">Market Heatmap</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedSector === null ? "default" : "outline"}
                    onClick={() => setSelectedSector(null)}
                    className="text-xs"
                  >
                    All
                  </Button>
                  {Array.from(new Set(heatmapData.map((d) => d.sector))).map((sector) => (
                    <Button
                      key={sector}
                      size="sm"
                      variant={selectedSector === sector ? "default" : "outline"}
                      onClick={() => setSelectedSector(sector)}
                      className="text-xs"
                    >
                      {sector}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 h-80">
                {filteredHeatmap.map((stock) => (
                  <div
                    key={stock.symbol}
                    className={`${getHeatmapColor(stock.change)} rounded p-2 flex flex-col justify-between text-white text-xs cursor-pointer hover:opacity-80 transition-opacity`}
                    style={{
                      minHeight: `${getHeatmapSize(stock.volume)}px`,
                      opacity: 0.8 + Math.abs(stock.change) / 10,
                    }}
                  >
                    <div className="font-semibold">{stock.symbol}</div>
                    <div>
                      <div className="font-bold">₹{stock.price}</div>
                      <div>
                        {stock.change > 0 ? "+" : ""}
                        {stock.change}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sector Performance */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-teal-400">Sector Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sectorData.map((sector) => (
                  <div key={sector.sector} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{sector.sector}</div>
                      <div className="text-xs text-slate-400">{sector.stocks} stocks</div>
                    </div>
                    <div className={`text-right ${sector.performance > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      <div className="font-bold">
                        {sector.performance > 0 ? "+" : ""}
                        {sector.performance}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Breadth Chart */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-teal-400">Market Breadth</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                advances: { label: "Advances", color: "hsl(var(--chart-1))" },
                declines: { label: "Declines", color: "hsl(var(--chart-2))" },
                unchanged: { label: "Unchanged", color: "hsl(var(--chart-3))" },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={breadthData}>
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-800 border border-slate-600 rounded p-2 text-sm">
                            <p className="text-slate-300">{`Time: ${label}`}</p>
                            {payload.map((entry, index) => (
                              <p key={index} style={{ color: entry.color }}>
                                {`${entry.dataKey}: ${entry.value}`}
                              </p>
                            ))}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="advances"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="declines"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="unchanged"
                    stackId="1"
                    stroke="#64748b"
                    fill="#64748b"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
