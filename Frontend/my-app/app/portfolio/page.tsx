"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts"
import Link from "next/link"

// Portfolio holdings data
const portfolioHoldings = [
  { symbol: "RELIANCE", quantity: 100, avgPrice: 2400, currentPrice: 2456.75, sector: "Energy", allocation: 25.2 },
  { symbol: "TCS", quantity: 50, avgPrice: 3200, currentPrice: 3234.5, sector: "IT", allocation: 16.8 },
  { symbol: "HDFC", quantity: 150, avgPrice: 1500, currentPrice: 1567.25, sector: "Banking", allocation: 24.3 },
  { symbol: "INFY", quantity: 80, avgPrice: 1400, currentPrice: 1456.8, sector: "IT", allocation: 12.1 },
  { symbol: "ICICIBANK", quantity: 200, avgPrice: 950, currentPrice: 987.45, sector: "Banking", allocation: 20.4 },
  { symbol: "ITC", quantity: 300, avgPrice: 450, currentPrice: 456.75, sector: "FMCG", allocation: 1.2 },
]

// Portfolio performance data
const performanceData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  return {
    date: date.toISOString().split("T")[0],
    portfolioValue: 950000 + Math.random() * 100000,
    benchmark: 950000 + Math.random() * 80000,
    dayPnL: (Math.random() - 0.5) * 20000,
  }
})

// Risk metrics data
const riskMetrics = {
  beta: 1.15,
  sharpeRatio: 1.42,
  maxDrawdown: -8.5,
  volatility: 18.2,
  var95: -15000,
  expectedShortfall: -22000,
}

// Sector allocation data
const sectorAllocation = [
  { sector: "Banking", value: 44.7, color: "#14b8a6" },
  { sector: "Energy", value: 25.2, color: "#3b82f6" },
  { sector: "IT", value: 28.9, color: "#8b5cf6" },
  { sector: "FMCG", value: 1.2, color: "#f59e0b" },
]

// P&L breakdown
const pnlBreakdown = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2024, i, 1).toLocaleDateString("en-US", { month: "short" }),
  realized: (Math.random() - 0.3) * 50000,
  unrealized: (Math.random() - 0.5) * 30000,
  dividends: Math.random() * 5000,
}))

export default function PortfolioPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("1M")
  const [totalValue, setTotalValue] = useState(0)
  const [totalPnL, setTotalPnL] = useState(0)

  useEffect(() => {
    const value = portfolioHoldings.reduce((sum, holding) => sum + holding.quantity * holding.currentPrice, 0)
    const pnl = portfolioHoldings.reduce(
      (sum, holding) => sum + holding.quantity * (holding.currentPrice - holding.avgPrice),
      0,
    )
    setTotalValue(value)
    setTotalPnL(pnl)
  }, [])

  const periods = ["1D", "1W", "1M", "3M", "6M", "1Y"]

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
              <Link href="/market-overview" className="text-slate-400 hover:text-teal-400 transition-colors">
                Market Overview
              </Link>
              <Link href="/charts" className="text-slate-400 hover:text-teal-400 transition-colors">
                Charts
              </Link>
              <span className="text-teal-400 font-medium">Portfolio</span>
              <Link href="/options" className="text-slate-400 hover:text-teal-400 transition-colors">
                Options
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-emerald-500 text-emerald-400">
              Live Portfolio
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">₹{totalValue.toLocaleString()}</div>
              <div className="text-sm text-slate-400">Portfolio NAV</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Total P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalPnL > 0 ? "text-emerald-400" : "text-red-400"}`}>
                ₹{totalPnL.toLocaleString()}
              </div>
              <div className={`text-sm ${totalPnL > 0 ? "text-emerald-400" : "text-red-400"}`}>
                {((totalPnL / (totalValue - totalPnL)) * 100).toFixed(2)}%
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Day P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">₹12,450</div>
              <div className="text-sm text-emerald-400">+1.28%</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Cash Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">₹45,000</div>
              <div className="text-sm text-slate-400">Available margin</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Performance Chart */}
          <Card className="lg:col-span-2 bg-slate-900/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-teal-400">Portfolio Performance</CardTitle>
                <div className="flex gap-2">
                  {periods.map((period) => (
                    <Button
                      key={period}
                      size="sm"
                      variant={selectedPeriod === period ? "default" : "outline"}
                      onClick={() => setSelectedPeriod(period)}
                      className="text-xs"
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  portfolio: { label: "Portfolio", color: "hsl(var(--chart-1))" },
                  benchmark: { label: "Benchmark", color: "hsl(var(--chart-2))" },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-800 border border-slate-600 rounded p-3 text-sm">
                              <p className="text-slate-300 font-medium">{label}</p>
                              {payload.map((entry, index) => (
                                <p key={index} style={{ color: entry.color }}>
                                  {`${entry.dataKey}: ₹${entry.value?.toLocaleString()}`}
                                </p>
                              ))}
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line type="monotone" dataKey="portfolioValue" stroke="#14b8a6" strokeWidth={2} dot={false} />
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      stroke="#64748b"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Sector Allocation */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-teal-400">Sector Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  allocation: { label: "Allocation", color: "hsl(var(--chart-1))" },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sectorAllocation} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                      {sectorAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-slate-800 border border-slate-600 rounded p-2 text-sm">
                              <p className="text-slate-300">
                                {data.sector}: {data.value}%
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2">
                {sectorAllocation.map((sector) => (
                  <div key={sector.sector} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: sector.color }}></div>
                      <span className="text-sm">{sector.sector}</span>
                    </div>
                    <span className="text-sm font-medium">{sector.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Holdings Table */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-teal-400">Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 text-slate-400">Symbol</th>
                    <th className="text-right py-3 text-slate-400">Qty</th>
                    <th className="text-right py-3 text-slate-400">Avg Price</th>
                    <th className="text-right py-3 text-slate-400">Current Price</th>
                    <th className="text-right py-3 text-slate-400">P&L</th>
                    <th className="text-right py-3 text-slate-400">P&L %</th>
                    <th className="text-right py-3 text-slate-400">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioHoldings.map((holding) => {
                    const pnl = holding.quantity * (holding.currentPrice - holding.avgPrice)
                    const pnlPercent = ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100
                    const value = holding.quantity * holding.currentPrice

                    return (
                      <tr key={holding.symbol} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 font-medium">{holding.symbol}</td>
                        <td className="text-right py-3">{holding.quantity}</td>
                        <td className="text-right py-3">₹{holding.avgPrice}</td>
                        <td className="text-right py-3">₹{holding.currentPrice}</td>
                        <td className={`text-right py-3 ${pnl > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          ₹{pnl.toLocaleString()}
                        </td>
                        <td className={`text-right py-3 ${pnlPercent > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {pnlPercent.toFixed(2)}%
                        </td>
                        <td className="text-right py-3">₹{value.toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Metrics */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-teal-400">Risk Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Beta</span>
                  <span className="font-medium">{riskMetrics.beta}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Sharpe Ratio</span>
                  <span className="font-medium text-emerald-400">{riskMetrics.sharpeRatio}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Max Drawdown</span>
                  <span className="font-medium text-red-400">{riskMetrics.maxDrawdown}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Volatility</span>
                  <span className="font-medium">{riskMetrics.volatility}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">VaR (95%)</span>
                  <span className="font-medium text-red-400">₹{riskMetrics.var95.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Expected Shortfall</span>
                  <span className="font-medium text-red-400">₹{riskMetrics.expectedShortfall.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* P&L Breakdown */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-teal-400">Monthly P&L Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  realized: { label: "Realized", color: "hsl(var(--chart-1))" },
                  unrealized: { label: "Unrealized", color: "hsl(var(--chart-2))" },
                  dividends: { label: "Dividends", color: "hsl(var(--chart-3))" },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pnlBreakdown}>
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-800 border border-slate-600 rounded p-2 text-sm">
                              <p className="text-slate-300">{label}</p>
                              {payload.map((entry, index) => (
                                <p key={index} style={{ color: entry.color }}>
                                  {`${entry.dataKey}: ₹${entry.value?.toLocaleString()}`}
                                </p>
                              ))}
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="realized" fill="#14b8a6" />
                    <Bar dataKey="unrealized" fill="#3b82f6" />
                    <Bar dataKey="dividends" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
