# HftBacktest

High-Frequency Trading Backtesting Framework

This framework is designed for developing high frequency trading and market making strategies. It focuses on accounting for both feed and order latencies, as well as the order queue position for order fill simulation. The framework aims to provide more accurate market replay-based backtesting, based on full order book and trade tick feed data.

## Core Features

Complete tick-by-tick simulation with customizable time intervals based on feed and order receipt. Full order book reconstruction from Level-2 Market-By-Price and Level-3 Market-By-Order feeds. Backtesting accounts for both feed and order latency using provided models or custom implementations. Order fill simulation incorporates order queue position modeling. Multi-asset and multi-exchange backtesting capabilities.

## Why Accurate Backtesting Matters

Trading is a highly competitive field where only small edges usually exist, but they can still make a significant difference. Because of this, backtesting must accurately simulate real-world conditions. It should neither rely on an overly conservative approach that hides these small edges and profit opportunities, nor on an overly aggressive one that overstates them through unrealistic simulation.

This is not about overfitting at the start. Before you even consider issues like overfitting, you need confidence that your backtesting truly reflects real-world execution. For example, if you run a live trading strategy in January 2025, the backtest for that exact period should produce results that closely align with the actual results. Once you've validated that your backtesting can accurately reproduce live trading results, then you can proceed to deeper research, optimization, and considerations around overfitting.

Accurate backtesting is the foundation. Without it, all further analysis becomes unreliable.

## Installation

Install using pip for Python 3.11+:

```
pip install hftbacktest
```

Or clone the development version:

```
git clone https://github.com/nkaz001/hftbacktest
```

## Basic Usage

```python
from hftbacktest import BacktestAsset, HashMapMarketDepthBacktest

asset = (
    BacktestAsset()
        .data(['market_data.gz'])
        .linear_asset(1.0)
        .power_prob_queue_model(2.0)
        .no_partial_fill_exchange()
        .trading_value_fee_model(-0.00005, 0.0007)
        .tick_size(0.01)
        .lot_size(0.001)
)

hbt = HashMapMarketDepthBacktest([asset])
```

## Architecture

**hftbacktest/** contains the core Rust library with backtesting engine, market depth implementations, and order processing models.

**py-hftbacktest/** provides Python bindings enabling strategy development in Python while maintaining performance through the Rust backend.

## License

MIT License
