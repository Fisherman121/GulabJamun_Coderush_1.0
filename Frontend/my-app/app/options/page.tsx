"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from "recharts"
import Link from "next/link"

// Generate options chain data
const generateOptionsChain = (spotPrice: number, expiry: string) => {
  const strikes = []
  const baseStrike = Math.floor(spotPrice / 50) * 50

  for (let i = -10; i <= 10; i++) {
    const strike = baseStrike + i * 50
    const isITM_Call = strike < spotPrice
    const isITM_Put = strike > spotPrice

    // Call options
    const callIV = 0.15 + Math.random() * 0.1 + Math.abs(i) * 0.005
    const callPrice = Math.max(0.05, isITM_Call ? spotPrice - strike + Math.random() * 20 : Math.random() * 30)
    const callOI = Math.floor(Math.random() * 50000) + 1000
    const callVolume = Math.floor(Math.random() * 10000)

    // Put options
    const putIV = 0.15 + Math.random() * 0.1 + Math.abs(i) * 0.005
    const putPrice = Math.max(0.05, isITM_Put ? strike - spotPrice + Math.random() * 20 : Math.random() * 30)
    const putOI = Math.floor(Math.random() * 50000) + 1000
    const putVolume = Math.floor(Math.random() * 10000)

    strikes.push({
      strike,
      call: {
        bid: callPrice - 0.5,
        ask: callPrice + 0.5,
        ltp: callPrice,
        change: (Math.random() - 0.5) * 10,
        volume: callVolume,
        oi: callOI,
        iv: callIV * 100,
      },
      put: {
        bid: putPrice - 0.5,
        ask: putPrice + 0.5,
        ltp: putPrice,
        change: (Math.random() - 0.5) * 10,
        volume: putVolume,
        oi: putOI,
        iv: putIV * 100,
      },
    })
  }

  return strikes
}

// Greeks data for visualization
const greeksData = Array.from({ length: 21 }, (_, i) => {
  const strike = 19500 + (i - 10) * 50
  return {
    strike,
    callDelta: Math.max(0, Math.min(1, 0.5 + (19650 - strike) / 1000)),
    putDelta: Math.max(-1, Math.min(0, -0.5 - (strike - 19650) / 1000)),
    gamma: Math.exp(-Math.pow((strike - 19650) / 200, 2)) * 0.01,
    theta: -Math.random() * 5,
    vega: Math.exp(-Math.pow((strike - 19650) / 300, 2)) * 20,
  }
})

// Volatility smile data
const volSmileData = Array.from({ length: 21 }, (_, i) => {
  const strike = 19500 + (i - 10) * 50
  const moneyness = strike / 19650
  const iv = 15 + Math.pow((moneyness - 1) * 100, 2) * 0.02 + Math.random() * 2
  return {
    strike,
    moneyness: moneyness.toFixed(3),
    iv: iv.toFixed(2),
  }
})

export default function OptionsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("NIFTY")
  const [selectedExpiry, setSelectedExpiry] = useState("28-DEC-2023")
  const [spotPrice, setSpotPrice] = useState(19650)
  const [optionsChain, setOptionsChain] = useState(generateOptionsChain(19650, "28-DEC-2023"))
  const [selectedView, setSelectedView] = useState("chain")

  useEffect(() => {
    const interval = setInterval(() => {
      setSpotPrice((prev) => prev + (Math.random() - 0.5) * 10)
      setOptionsChain(generateOptionsChain(spotPrice, selectedExpiry))
    }, 2000)

    return () => clearInterval(interval)
  }, [spotPrice, selectedExpiry])

  const symbols = ["NIFTY", "BANKNIFTY", "RELIANCE", "TCS", "HDFC"]
  const expiries = ["28-DEC-2023", "04-JAN-2024", "11-JAN-2024", "25-JAN-2024"]
  const views = ["chain", "greeks", "volatility"]

  const atmStrike = optionsChain.find(
    (option) =>
      Math.abs(option.strike - spotPrice) === Math.min(...optionsChain.map((o) => Math.abs(o.strike - spotPrice))),
  )?.strike

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
              <Link href="/portfolio" className="text-slate-400 hover:text-teal-400 transition-colors">
                Portfolio
              </Link>
              <span className="text-teal-400 font-medium">Options</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-emerald-500 text-emerald-400">
              Live Options
            </Badge>
            <span className="text-lg font-bold text-teal-400">
              {selectedSymbol}: ₹{spotPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Controls */}
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
              {expiries.map((expiry) => (
                <Button
                  key={expiry}
                  size="sm"
                  variant={selectedExpiry === expiry ? "default" : "outline"}
                  onClick={() => setSelectedExpiry(expiry)}
                  className="text-xs"
                >
                  {expiry}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {views.map((view) => (
              <Button
                key={view}
                size="sm"
                variant={selectedView === view ? "default" : "outline"}
                onClick={() => setSelectedView(view)}
                className="text-xs capitalize"
              >
                {view}
              </Button>
            ))}
          </div>
        </div>

        {selectedView === "chain" && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-teal-400">
                Options Chain - {selectedSymbol} {selectedExpiry}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-center py-2 text-slate-400" colSpan={4}>
                        CALLS
                      </th>
                      <th className="text-center py-2 text-teal-400 font-bold">STRIKE</th>
                      <th className="text-center py-2 text-slate-400" colSpan={4}>
                        PUTS
                      </th>
                    </tr>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="text-right py-2">OI</th>
                      <th className="text-right py-2">Volume</th>
                      <th className="text-right py-2">LTP</th>
                      <th className="text-right py-2">Change</th>
                      <th className="text-center py-2">Strike</th>
                      <th className="text-left py-2">Change</th>
                      <th className="text-left py-2">LTP</th>
                      <th className="text-left py-2">Volume</th>
                      <th className="text-left py-2">OI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optionsChain.map((option) => {
                      const isATM = option.strike === atmStrike
                      return (
                        <tr
                          key={option.strike}
                          className={`border-b border-slate-800 hover:bg-slate-800/50 ${isATM ? "bg-teal-900/20" : ""}`}
                        >
                          {/* Call Options */}
                          <td className="text-right py-2">{option.call.oi.toLocaleString()}</td>
                          <td className="text-right py-2">{option.call.volume.toLocaleString()}</td>
                          <td className="text-right py-2 font-medium">{option.call.ltp.toFixed(2)}</td>
                          <td
                            className={`text-right py-2 ${option.call.change > 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {option.call.change > 0 ? "+" : ""}
                            {option.call.change.toFixed(2)}
                          </td>

                          {/* Strike */}
                          <td className={`text-center py-2 font-bold ${isATM ? "text-teal-400" : "text-slate-100"}`}>
                            {option.strike}
                          </td>

                          {/* Put Options */}
                          <td
                            className={`text-left py-2 ${option.put.change > 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {option.put.change > 0 ? "+" : ""}
                            {option.put.change.toFixed(2)}
                          </td>
                          <td className="text-left py-2 font-medium">{option.put.ltp.toFixed(2)}</td>
                          <td className="text-left py-2">{option.put.volume.toLocaleString()}</td>
                          <td className="text-left py-2">{option.put.oi.toLocaleString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedView === "greeks" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-teal-400">Delta Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    callDelta: { label: "Call Delta", color: "hsl(var(--chart-1))" },
                    putDelta: { label: "Put Delta", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={greeksData}>
                      <XAxis dataKey="strike" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-800 border border-slate-600 rounded p-2 text-sm">
                                <p className="text-slate-300">Strike: {label}</p>
                                {payload.map((entry, index) => (
                                  <p key={index} style={{ color: entry.color }}>
                                    {`${entry.dataKey}: ${entry.value?.toFixed(3)}`}
                                  </p>
                                ))}
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Line type="monotone" dataKey="callDelta" stroke="#14b8a6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="putDelta" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-teal-400">Gamma & Vega</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    gamma: { label: "Gamma", color: "hsl(var(--chart-3))" },
                    vega: { label: "Vega", color: "hsl(var(--chart-4))" },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={greeksData}>
                      <XAxis dataKey="strike" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-800 border border-slate-600 rounded p-2 text-sm">
                                <p className="text-slate-300">Strike: {label}</p>
                                {payload.map((entry, index) => (
                                  <p key={index} style={{ color: entry.color }}>
                                    {`${entry.dataKey}: ${entry.value?.toFixed(3)}`}
                                  </p>
                                ))}
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Line type="monotone" dataKey="gamma" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="vega" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === "volatility" && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-teal-400">Implied Volatility Smile</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  iv: { label: "Implied Volatility", color: "hsl(var(--chart-1))" },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volSmileData}>
                    <XAxis dataKey="strike" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-slate-800 border border-slate-600 rounded p-3 text-sm">
                              <p className="text-slate-300">Strike: {label}</p>
                              <p className="text-slate-300">Moneyness: {data.moneyness}</p>
                              <p className="text-teal-400">IV: {data.iv}%</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="iv"
                      stroke="#14b8a6"
                      fill="#14b8a6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Options Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Total Call OI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">
                {optionsChain.reduce((sum, opt) => sum + opt.call.oi, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Total Put OI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {optionsChain.reduce((sum, opt) => sum + opt.put.oi, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">PCR (OI)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {(
                  optionsChain.reduce((sum, opt) => sum + opt.put.oi, 0) /
                  optionsChain.reduce((sum, opt) => sum + opt.call.oi, 0)
                ).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Max Pain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-400">{atmStrike}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
