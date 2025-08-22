"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts"
import Link from "next/link"

// Generate dynamic candlestick data
const generateCandlestickData = () => {
  const data = []
  let price = 19500
  for (let i = 0; i < 100; i++) {
    const change = (Math.random() - 0.5) * 100
    const open = price
    const close = price + change
    const high = Math.max(open, close) + Math.random() * 50
    const low = Math.min(open, close) - Math.random() * 50

    data.push({
      time: `${9 + Math.floor(i / 10)}:${(i % 10) * 6}${i % 10 === 0 ? "0" : ""}`,
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      volume: Math.floor(Math.random() * 1000000) + 100000,
    })
    price = close
  }
  return data
}

// Volume profile data
const volumeProfileData = Array.from({ length: 50 }, (_, i) => ({
  price: 19400 + i * 10,
  volume: Math.floor(Math.random() * 500000) + 50000,
  poc: i === 25, // Point of Control
}))

// Order flow data
const orderFlowData = Array.from({ length: 20 }, (_, i) => ({
  time: `${14}:${i * 3}`,
  buyVolume: Math.floor(Math.random() * 100000) + 20000,
  sellVolume: Math.floor(Math.random() * 100000) + 20000,
  delta: Math.floor((Math.random() - 0.5) * 50000),
}))

const generateVolatilityData = () => {
  const data = []
  let vol = 0.15
  for (let i = 0; i < 100; i++) {
    const change = (Math.random() - 0.5) * 0.02
    vol = Math.max(0.05, Math.min(0.5, vol + change))
    data.push({
      time: `${9 + Math.floor(i / 10)}:${(i % 10) * 6}${i % 10 === 0 ? "0" : ""}`,
      volatility: Number.parseFloat((vol * 100).toFixed(2)),
      impliedVol: Number.parseFloat(((vol + Math.random() * 0.02) * 100).toFixed(2)),
      historicalVol: Number.parseFloat(((vol - 0.01 + Math.random() * 0.02) * 100).toFixed(2)),
    })
  }
  return data
}

const generateOrderBookData = () => {
  const basePrice = 19500
  const bids = []
  const asks = []

  for (let i = 0; i < 10; i++) {
    bids.push({
      price: basePrice - (i + 1) * 0.25,
      quantity: Math.floor(Math.random() * 5000) + 100,
      orders: Math.floor(Math.random() * 50) + 1,
    })
    asks.push({
      price: basePrice + (i + 1) * 0.25,
      quantity: Math.floor(Math.random() * 5000) + 100,
      orders: Math.floor(Math.random() * 50) + 1,
    })
  }

  return { bids: bids.reverse(), asks }
}

const generateVolatilityClusteringData = () => {
  const data = []
  let baseVol = 0.15
  let clusterPhase = 0

  for (let i = 0; i < 200; i++) {
    // Create clustering effect
    if (i % 40 === 0) {
      clusterPhase = Math.random() > 0.5 ? 1 : -1
    }

    const clusterEffect = clusterPhase * 0.05 * Math.sin(i * 0.1)
    const randomWalk = (Math.random() - 0.5) * 0.01
    baseVol = Math.max(0.05, Math.min(0.4, baseVol + randomWalk + clusterEffect))

    data.push({
      time: i,
      volatility: Number.parseFloat((baseVol * 100).toFixed(2)),
      garch: Number.parseFloat(((baseVol + Math.random() * 0.01) * 100).toFixed(2)),
      realized: Number.parseFloat(((baseVol - 0.005 + Math.random() * 0.01) * 100).toFixed(2)),
    })
  }
  return data
}

const generatePnLData = () => {
  const data = []
  let cumulativePnL = 0

  for (let i = 0; i < 100; i++) {
    const trade = (Math.random() - 0.45) * 1000 // Slight positive bias
    cumulativePnL += trade

    data.push({
      time: `${9 + Math.floor(i / 10)}:${(i % 10) * 6}${i % 10 === 0 ? "0" : ""}`,
      tradePnL: Number.parseFloat(trade.toFixed(2)),
      cumulativePnL: Number.parseFloat(cumulativePnL.toFixed(2)),
      unrealizedPnL: Number.parseFloat(((Math.random() - 0.5) * 500).toFixed(2)),
      drawdown: Number.parseFloat(
        Math.min(0, cumulativePnL - Math.max(...data.map((d) => d?.cumulativePnL || 0), 0)).toFixed(2),
      ),
    })
  }
  return data
}

export default function ChartsPage() {
  const [candlestickData, setCandlestickData] = useState(generateCandlestickData())
  const [volatilityData, setVolatilityData] = useState(generateVolatilityData())
  const [orderBookData, setOrderBookData] = useState(generateOrderBookData())
  const [volatilityClusteringData] = useState(generateVolatilityClusteringData())
  const [pnlData, setPnlData] = useState(generatePnLData())

  const [selectedTimeframe, setSelectedTimeframe] = useState("1m")
  const [selectedSymbol, setSelectedSymbol] = useState("NIFTY")
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setCandlestickData((prev) => {
          const newData = [...prev]
          const lastCandle = newData[newData.length - 1]
          const change = (Math.random() - 0.5) * 20

          newData[newData.length - 1] = {
            ...lastCandle,
            close: Math.round(lastCandle.close + change),
            high: Math.max(lastCandle.high, lastCandle.close + change),
            low: Math.min(lastCandle.low, lastCandle.close + change),
            volume: lastCandle.volume + Math.floor(Math.random() * 10000),
          }

          return newData
        })

        setVolatilityData((prev) => {
          const newData = [...prev]
          const lastVol = newData[newData.length - 1]
          const change = (Math.random() - 0.5) * 0.5

          newData[newData.length - 1] = {
            ...lastVol,
            volatility: Math.max(5, Math.min(50, lastVol.volatility + change)),
            impliedVol: Math.max(5, Math.min(50, lastVol.impliedVol + (Math.random() - 0.5) * 0.3)),
          }
          return newData
        })

        setOrderBookData(generateOrderBookData())

        setPnlData((prev) => {
          const newData = [...prev]
          const lastPnL = newData[newData.length - 1]
          const newTrade = (Math.random() - 0.45) * 100

          newData[newData.length - 1] = {
            ...lastPnL,
            tradePnL: Number.parseFloat(newTrade.toFixed(2)),
            cumulativePnL: Number.parseFloat((lastPnL.cumulativePnL + newTrade).toFixed(2)),
            unrealizedPnL: Number.parseFloat(((Math.random() - 0.5) * 500).toFixed(2)),
          }
          return newData
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isLive])

  const symbols = ["NIFTY", "BANKNIFTY", "RELIANCE", "TCS", "HDFC"]
  const timeframes = ["1m", "5m", "15m", "1h", "1d"]

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
              <span className="text-teal-400 font-medium">Charts</span>
              <Link href="/portfolio" className="text-slate-400 hover:text-teal-400 transition-colors">
                Portfolio
              </Link>
              <Link href="/options" className="text-slate-400 hover:text-teal-400 transition-colors">
                Options
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={isLive ? "default" : "outline"} className="border-emerald-500 text-emerald-400">
              {isLive ? "Live" : "Paused"}
            </Badge>
            <Button size="sm" variant="outline" onClick={() => setIsLive(!isLive)} className="border-slate-600">
              {isLive ? "Pause" : "Resume"}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Chart Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {symbols.map((symbol) => (
                <Button
                  key={symbol}
                  size="sm"
                  variant={selectedSymbol === symbol ? "default" : "outline"}
                  onClick={() => setSelectedSymbol(symbol)}
                  className="text-xs"
                >
                  {symbol}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              {timeframes.map((tf) => (
                <Button
                  key={tf}
                  size="sm"
                  variant={selectedTimeframe === tf ? "default" : "outline"}
                  onClick={() => setSelectedTimeframe(tf)}
                  className="text-xs"
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
          <div className="text-2xl font-bold text-teal-400">
            {selectedSymbol}: {candlestickData[candlestickData.length - 1]?.close || 0}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-3 bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-teal-400">Price Chart - {selectedSymbol}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  price: { label: "Price", color: "hsl(var(--chart-1))" },
                }}
                className="h-96"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={candlestickData.slice(-50)}>
                    <XAxis dataKey="time" stroke="#64748b" />
                    <YAxis domain={["dataMin - 50", "dataMax + 50"]} stroke="#64748b" />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-slate-800 border border-slate-600 rounded p-3 text-sm">
                              <p className="text-slate-300 font-medium">{label}</p>
                              <p className="text-emerald-400">O: {data.open}</p>
                              <p className="text-red-400">H: {data.high}</p>
                              <p className="text-blue-400">L: {data.low}</p>
                              <p className="text-teal-400">C: {data.close}</p>
                              <p className="text-slate-400">Vol: {data.volume?.toLocaleString()}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line type="monotone" dataKey="close" stroke="#14b8a6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Volume Profile */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-teal-400 text-sm">Volume Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  volume: { label: "Volume", color: "hsl(var(--chart-2))" },
                }}
                className="h-96"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeProfileData} layout="horizontal">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="price" width={60} stroke="#64748b" />
                    <Bar dataKey="volume" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Volume Chart */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-teal-400">Volume Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                volume: { label: "Volume", color: "hsl(var(--chart-3))" },
              }}
              className="h-32"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={candlestickData.slice(-50)}>
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Bar dataKey="volume" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Order Flow */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-teal-400">Order Flow & Delta</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                buyVolume: { label: "Buy Volume", color: "hsl(var(--chart-1))" },
                sellVolume: { label: "Sell Volume", color: "hsl(var(--chart-2))" },
                delta: { label: "Delta", color: "hsl(var(--chart-4))" },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={orderFlowData}>
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
                                {`${entry.dataKey}: ${entry.value?.toLocaleString()}`}
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
                    dataKey="buyVolume"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="sellVolume"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                  <Line type="monotone" dataKey="delta" stroke="#f59e0b" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-teal-400">Volatility Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  volatility: { label: "Realized Vol", color: "hsl(var(--chart-1))" },
                  impliedVol: { label: "Implied Vol", color: "hsl(var(--chart-2))" },
                  historicalVol: { label: "Historical Vol", color: "hsl(var(--chart-3))" },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={volatilityData.slice(-50)}>
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
                                  {`${entry.dataKey}: ${entry.value}%`}
                                </p>
                              ))}
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line type="monotone" dataKey="volatility" stroke="#14b8a6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="impliedVol" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="historicalVol" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-teal-400">Level 2 Order Book</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 h-64 overflow-y-auto">
                <div className="text-xs text-slate-400 grid grid-cols-3 gap-2 font-medium">
                  <span>Price</span>
                  <span>Quantity</span>
                  <span>Orders</span>
                </div>

                {/* Asks */}
                {orderBookData.asks
                  .slice(0, 5)
                  .reverse()
                  .map((ask, i) => (
                    <div
                      key={`ask-${i}`}
                      className="text-xs grid grid-cols-3 gap-2 text-red-400 bg-red-950/20 p-1 rounded"
                    >
                      <span>{ask.price.toFixed(2)}</span>
                      <span>{ask.quantity.toLocaleString()}</span>
                      <span>{ask.orders}</span>
                    </div>
                  ))}

                {/* Spread */}
                <div className="text-xs text-center text-slate-400 py-1 border-y border-slate-700">
                  Spread: {(orderBookData.asks[0].price - orderBookData.bids[0].price).toFixed(2)}
                </div>

                {/* Bids */}
                {orderBookData.bids.slice(0, 5).map((bid, i) => (
                  <div
                    key={`bid-${i}`}
                    className="text-xs grid grid-cols-3 gap-2 text-green-400 bg-green-950/20 p-1 rounded"
                  >
                    <span>{bid.price.toFixed(2)}</span>
                    <span>{bid.quantity.toLocaleString()}</span>
                    <span>{bid.orders}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-teal-400">Volatility Clustering & GARCH Model</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                volatility: { label: "Realized Volatility", color: "hsl(var(--chart-1))" },
                garch: { label: "GARCH Forecast", color: "hsl(var(--chart-2))" },
                realized: { label: "Realized Vol", color: "hsl(var(--chart-3))" },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volatilityClusteringData}>
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-800 border border-slate-600 rounded p-2 text-sm">
                            <p className="text-slate-300">{`Period: ${label}`}</p>
                            {payload.map((entry, index) => (
                              <p key={index} style={{ color: entry.color }}>
                                {`${entry.dataKey}: ${entry.value}%`}
                              </p>
                            ))}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area type="monotone" dataKey="volatility" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
                  <Line type="monotone" dataKey="garch" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="realized" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-teal-400">Real-Time P&L & Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-trading-gain">
                  ${pnlData[pnlData.length - 1]?.cumulativePnL.toLocaleString() || 0}
                </div>
                <div className="text-xs text-slate-400">Cumulative P&L</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-trading-loss">
                  ${pnlData[pnlData.length - 1]?.unrealizedPnL.toLocaleString() || 0}
                </div>
                <div className="text-xs text-slate-400">Unrealized P&L</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-trading-warning">
                  ${pnlData[pnlData.length - 1]?.drawdown.toLocaleString() || 0}
                </div>
                <div className="text-xs text-slate-400">Max Drawdown</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400">
                  {(((pnlData[pnlData.length - 1]?.cumulativePnL || 0) / 100000) * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-slate-400">Return %</div>
              </div>
            </div>

            <ChartContainer
              config={{
                cumulativePnL: { label: "Cumulative P&L", color: "hsl(var(--chart-1))" },
                unrealizedPnL: { label: "Unrealized P&L", color: "hsl(var(--chart-2))" },
                drawdown: { label: "Drawdown", color: "hsl(var(--chart-3))" },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pnlData.slice(-50)}>
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
                                {`${entry.dataKey}: $${entry.value?.toLocaleString()}`}
                              </p>
                            ))}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line type="monotone" dataKey="cumulativePnL" stroke="#14b8a6" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="unrealizedPnL" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
