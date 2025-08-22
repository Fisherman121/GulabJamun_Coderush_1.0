"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts"
import Link from "next/link"
import {
  Search,
  Zap,
  Settings,
  User,
  Activity,
  TrendingUp,
  AlertTriangle,
  Play,
  Pause,
  Square,
  Wifi,
  Clock,
} from "lucide-react"

const portfolioData = [
  { time: "09:15", value: 2450000, volume: 1200 },
  { time: "09:30", value: 2465000, volume: 1800 },
  { time: "09:45", value: 2478000, volume: 2100 },
  { time: "10:00", value: 2456000, volume: 1600 },
  { time: "10:15", value: 2489000, volume: 2400 },
  { time: "10:30", value: 2501000, volume: 2800 },
]

const orderBookData = [
  { price: 2505.5, quantity: 1200, side: "sell" },
  { price: 2504.75, quantity: 800, side: "sell" },
  { price: 2504.25, quantity: 1500, side: "sell" },
  { price: 2503.8, quantity: 2200, side: "sell" },
  { price: 2503.25, quantity: 900, side: "sell" },
  { price: 2502.75, quantity: 1800, side: "buy" },
  { price: 2502.25, quantity: 1100, side: "buy" },
  { price: 2501.8, quantity: 2400, side: "buy" },
  { price: 2501.25, quantity: 1600, side: "buy" },
  { price: 2500.75, quantity: 3200, side: "buy" },
]

const watchlistData = [
  { symbol: "RELIANCE", price: 2503.25, change: 12.45, changePercent: 0.5, volume: "2.4M" },
  { symbol: "TCS", price: 3456.8, change: -23.15, changePercent: -0.66, volume: "1.8M" },
  { symbol: "HDFCBANK", price: 1678.9, change: 8.75, changePercent: 0.52, volume: "3.1M" },
  { symbol: "INFY", price: 1234.5, change: 15.2, changePercent: 1.25, volume: "2.7M" },
  { symbol: "ICICIBANK", price: 987.65, change: -5.3, changePercent: -0.53, volume: "1.9M" },
]

const activeStrategies = [
  { name: "Momentum Scalper", status: "running", pnl: 12340, trades: 45 },
  { name: "Mean Reversion", status: "paused", pnl: -2150, trades: 23 },
  { name: "Arbitrage Bot", status: "running", pnl: 8750, trades: 67 },
  { name: "Volatility Harvester", status: "stopped", pnl: 4560, trades: 12 },
]

export default function TradingDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStock, setSelectedStock] = useState("RELIANCE")
  const [selectedTimeframe, setSelectedTimeframe] = useState("5m")
  const [emergencyStopActive, setEmergencyStopActive] = useState(false)
  const [strategies, setStrategies] = useState(activeStrategies)
  const [filteredWatchlist, setFilteredWatchlist] = useState(watchlistData)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredWatchlist(watchlistData)
    } else {
      const filtered = watchlistData.filter((stock) => stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredWatchlist(filtered)
    }
  }, [searchQuery])

  const toggleStrategy = (strategyName: string) => {
    if (emergencyStopActive) return

    setStrategies((prev) =>
      prev.map((strategy) => {
        if (strategy.name === strategyName) {
          let newStatus = strategy.status
          if (strategy.status === "running") newStatus = "paused"
          else if (strategy.status === "paused") newStatus = "running"
          else if (strategy.status === "stopped") newStatus = "running"

          return { ...strategy, status: newStatus }
        }
        return strategy
      }),
    )
  }

  const handleEmergencyStop = () => {
    setEmergencyStopActive(!emergencyStopActive)
    if (!emergencyStopActive) {
      setStrategies((prev) => prev.map((strategy) => ({ ...strategy, status: "stopped" })))
    }
  }

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left: Logo and Branding */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold font-sans">HFT Pro</span>
            </div>
            {/* Navigation Menu */}
            <nav className="flex gap-4">
              <span className="text-primary font-medium">Dashboard</span>
              <Link href="/market-overview" className="text-muted-foreground hover:text-primary transition-colors">
                Market Overview
              </Link>
              <Link href="/charts" className="text-muted-foreground hover:text-primary transition-colors">
                Charts
              </Link>
              <Link href="/portfolio" className="text-muted-foreground hover:text-primary transition-colors">
                Portfolio
              </Link>
              <Link href="/options" className="text-muted-foreground hover:text-primary transition-colors">
                Options
              </Link>
            </nav>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search stocks (RELIANCE, TCS, HDFCBANK...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
          </div>

          {/* Right: Actions and Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Wifi className="h-4 w-4 text-trading-gain" />
              <span className="text-trading-gain font-medium">LIVE</span>
              <span className="text-muted-foreground">0.8ms</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{currentTime.toLocaleTimeString("en-IN")}</span>
            </div>
            <Button size="sm" variant={emergencyStopActive ? "default" : "destructive"} onClick={handleEmergencyStop}>
              <Square className="h-4 w-4 mr-1" />
              {emergencyStopActive ? "Resume Trading" : "Emergency Stop"}
            </Button>
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrolling Ticker */}
        <div className="bg-muted/50 px-6 py-2 text-sm overflow-hidden">
          <div className="animate-scroll whitespace-nowrap">
            <span className="text-trading-gain">Portfolio P&L: +₹2,45,678</span>
            <span className="mx-4 text-muted-foreground">|</span>
            <span className="text-trading-gain">Day P&L: +₹12,340</span>
            <span className="mx-4 text-muted-foreground">|</span>
            <span className="text-foreground">
              Active Algos: {strategies.filter((s) => s.status === "running").length}
            </span>
            <span className="mx-4 text-muted-foreground">|</span>
            <span className="text-foreground">Latency: 0.8ms</span>
            <span className="mx-4 text-muted-foreground">|</span>
            <span className="text-trading-warning">NSE: Open</span>
            <span className="mx-4 text-muted-foreground">|</span>
            <span className="text-trading-warning">BSE: Open</span>
            {emergencyStopActive && (
              <>
                <span className="mx-4 text-muted-foreground">|</span>
                <span className="text-destructive font-bold">⚠️ EMERGENCY STOP ACTIVE</span>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-80 border-r border-border bg-card p-4 h-[calc(100vh-120px)] overflow-y-auto">
          {/* Watchlist */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 font-sans">Watchlist</h3>
            <div className="space-y-2">
              {filteredWatchlist.map((stock) => (
                <Card
                  key={stock.symbol}
                  className={`p-3 hover:bg-accent/50 cursor-pointer transition-colors ${
                    selectedStock === stock.symbol ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleStockSelect(stock.symbol)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground">Vol: {stock.volume}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">₹{stock.price}</div>
                      <div
                        className={`text-xs font-medium ${stock.change >= 0 ? "text-trading-gain" : "text-trading-loss"}`}
                      >
                        {stock.change >= 0 ? "+" : ""}
                        {stock.change} ({stock.changePercent}%)
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {filteredWatchlist.length === 0 && searchQuery && (
                <div className="text-center text-muted-foreground py-4">No stocks found matching "{searchQuery}"</div>
              )}
            </div>
          </div>

          {/* Active Strategies */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 font-sans">Active Strategies</h3>
            <div className="space-y-2">
              {strategies.map((strategy) => (
                <Card
                  key={strategy.name}
                  className={`p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                    emergencyStopActive ? "opacity-50" : ""
                  }`}
                  onClick={() => toggleStrategy(strategy.name)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-sm">{strategy.name}</div>
                    <Badge
                      variant={
                        strategy.status === "running"
                          ? "default"
                          : strategy.status === "paused"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {strategy.status === "running" && <Play className="h-3 w-3 mr-1" />}
                      {strategy.status === "paused" && <Pause className="h-3 w-3 mr-1" />}
                      {strategy.status === "stopped" && <Square className="h-3 w-3 mr-1" />}
                      {strategy.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={`font-mono ${strategy.pnl >= 0 ? "text-trading-gain" : "text-trading-loss"}`}>
                      {strategy.pnl >= 0 ? "+" : ""}₹{strategy.pnl}
                    </span>
                    <span className="text-muted-foreground">{strategy.trades} trades</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Portfolio Summary */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 font-sans">Portfolio Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Equity</span>
                <span className="font-mono">₹25,45,678</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available Margin</span>
                <span className="font-mono">₹8,76,543</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Day's Performance</span>
                <span className="font-mono text-trading-gain">+₹12,340 (0.48%)</span>
              </div>
            </div>
          </Card>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 space-y-6">
          {/* Primary Chart Section */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="font-sans">
                  {selectedStock} - ₹{watchlistData.find((s) => s.symbol === selectedStock)?.price || "2,503.25"}
                </CardTitle>
                <div className="flex gap-2">
                  {["1m", "5m", "15m", "1h", "1d"].map((timeframe) => (
                    <Button
                      key={timeframe}
                      size="sm"
                      variant={timeframe === selectedTimeframe ? "default" : "outline"}
                      onClick={() => setSelectedTimeframe(timeframe)}
                    >
                      {timeframe}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer
                  config={{
                    value: {
                      label: "Price",
                      color: "hsl(var(--chart-1))",
                    },
                    volume: {
                      label: "Volume",
                      color: "hsl(var(--chart-5))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portfolioData}>
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                      />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">Time</span>
                                    <span className="font-bold text-muted-foreground">{label}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">Price</span>
                                    <span className="font-bold">₹{payload[0]?.value?.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--chart-1))"
                        fill="hsl(var(--chart-1))"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Market Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Value</p>
                  <p className="text-2xl font-bold font-mono">₹25.4L</p>
                </div>
                <TrendingUp className="h-8 w-8 text-trading-gain" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-trading-gain">+0.48% today</span>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Day P&L</p>
                  <p className="text-2xl font-bold font-mono text-trading-gain">+₹12.3K</p>
                </div>
                <Activity className="h-8 w-8 text-trading-gain" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-muted-foreground">156 trades executed</span>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Positions</p>
                  <p className="text-2xl font-bold font-mono">23</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-trading-warning" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-muted-foreground">5 require attention</span>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className="text-2xl font-bold font-mono">4.2%</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-trading-gain flex items-center justify-center">
                  <span className="text-xs font-bold text-white">OK</span>
                </div>
              </div>
              <div className="mt-2">
                <Progress value={42} className="h-2" />
              </div>
            </Card>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 border-l border-border bg-card p-4 h-[calc(100vh-120px)] overflow-y-auto">
          {/* Order Book */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 font-sans">Order Book - {selectedStock}</h3>
            <div className="text-xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Price</TableHead>
                    <TableHead className="text-xs text-right">Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderBookData.map((order, index) => (
                    <TableRow key={index} className="h-6">
                      <TableCell
                        className={`font-mono text-xs ${order.side === "sell" ? "text-trading-loss" : "text-trading-gain"}`}
                      >
                        {order.price}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">{order.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Risk Metrics */}
          <Card className="p-4 mb-6">
            <h3 className="font-semibold mb-3 font-sans">Risk Radar</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>VaR (95%)</span>
                  <span className="font-mono">4.2%</span>
                </div>
                <Progress value={42} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Max Drawdown</span>
                  <span className="font-mono text-trading-loss">-2.1%</span>
                </div>
                <Progress value={21} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Concentration Risk</span>
                  <span className="font-mono">Low</span>
                </div>
                <Progress value={15} className="h-2" />
              </div>
            </div>
          </Card>

          {/* Execution Quality */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 font-sans">Execution Quality</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Slippage</span>
                <span className="font-mono">0.02%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fill Rate</span>
                <span className="font-mono text-trading-gain">98.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Latency (Avg)</span>
                <span className="font-mono">0.8ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Market Impact</span>
                <span className="font-mono">0.01%</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
