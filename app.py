"""
Advanced HFT Trading Bot Web Application

This Flask application provides a web interface for the Jane Street-inspired
High-Frequency Trading Bot with real-time analytics and visualization.
"""

import os
import sys
import json
import time
import threading
from datetime import datetime
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import numpy as np

# Import our HFT trading bot
from hft_trading_bot import get_or_create_bot, HighFrequencyTradingBot

app = Flask(__name__)
CORS(app)

print("🚀 Starting HFT Backtesting Web Application...")
print("📊 Dashboard will be available at: http://localhost:5000")

# Count available data files
data_extensions = ['.gz', '.parquet', '.csv']
data_dirs = ['examples/usdm', 'examples/cm', 'examples/spot', 'examples/hyperliquid', 'examples/mexc']
data_files = []

for data_dir in data_dirs:
    if os.path.exists(data_dir):
        for file in os.listdir(data_dir):
            if any(file.endswith(ext) for ext in data_extensions):
                data_files.append(os.path.join(data_dir, file))

print(f"💹 Market data files found: {len(data_files)}")

class HFTBacktester:
    """Enhanced backtester with NSE simulation capabilities"""
    
    def __init__(self):
        self.data_files = data_files
        self.is_running = False
        self.current_symbol = "RELIANCE"
        self.current_price = 2850.0
        self.trade_count = 0
        self.pnl = 0.0
        
    def run_backtest_simulation(self, symbol="RELIANCE", duration=300):
        """Run an enhanced backtest simulation with NSE support"""
        self.is_running = True
        self.current_symbol = symbol
        
        # Market simulation parameters
        base_price = self._get_nse_base_price(symbol)
        self.current_price = base_price
        
        # NSE-specific parameters
        if symbol in ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK', 'LT', 'ASIANPAINT']:
            tick_size = 0.05  # ₹0.05 tick size for Indian equities
            currency = "₹"
        else:
            tick_size = 0.01  # $0.01 for other markets
            currency = "$"
        
        # Simulation loop
        for i in range(duration):
            if not self.is_running:
                break
                
            # Price movement simulation
            volatility = np.random.uniform(0.001, 0.003)
            price_change = np.random.normal(0, volatility)
            self.current_price *= (1 + price_change)
            
            # Round to tick size
            self.current_price = round(self.current_price / tick_size) * tick_size
            
            # Simulate trades
            if np.random.random() < 0.1:  # 10% chance of trade per iteration
                trade_pnl = np.random.uniform(-50, 100)  # Random P&L
                self.pnl += trade_pnl
                self.trade_count += 1
            
            time.sleep(0.1)  # 100ms per iteration
        
        self.is_running = False
    
    def _get_nse_base_price(self, symbol):
        """Get base price for NSE symbols"""
        nse_prices = {
            'RELIANCE': 2850.0,
            'TCS': 4200.0,
            'HDFCBANK': 1670.0,
            'INFY': 1860.0,
            'ITC': 485.0,
            'SBIN': 820.0,
            'BHARTIARTL': 1520.0,
            'KOTAKBANK': 1750.0,
            'LT': 3600.0,
            'ASIANPAINT': 2950.0
        }
        return nse_prices.get(symbol, 1000.0)

# Global backtester instance
backtester = HFTBacktester()

# Routes
@app.route('/')
def index():
    """Main trading dashboard page"""
    return render_template('dashboard.html')

@app.route('/hft')
def hft_dashboard():
    """Jane Street-inspired HFT Bot Dashboard"""
    return render_template('hft_dashboard.html')

@app.route('/advanced_charts')
def advanced_charts():
    """Advanced Charts Page with Professional Visualizations"""
    return render_template('advanced_charts.html')

@app.route('/simple')
def simple_dashboard():
    """Simple backtesting dashboard"""
    return render_template('index.html')

@app.route('/api/data-files')
def get_data_files():
    """Get list of available data files"""
    return jsonify(backtester.data_files)

@app.route('/api/backtest-status')
def get_backtest_status():
    """Get current backtest status"""
    return jsonify({
        'is_running': backtester.is_running,
        'symbol': backtester.current_symbol,
        'current_price': backtester.current_price,
        'trade_count': backtester.trade_count,
        'pnl': backtester.pnl
    })

@app.route('/api/start-backtest', methods=['POST'])
def start_backtest():
    """Start backtest with specified parameters"""
    data = request.get_json()
    symbol = data.get('symbol', 'RELIANCE')
    duration = data.get('duration', 300)
    
    if backtester.is_running:
        return jsonify({'success': False, 'message': 'Backtest already running'})
    
    # Start backtest in separate thread
    thread = threading.Thread(
        target=backtester.run_backtest_simulation,
        args=(symbol, duration)
    )
    thread.daemon = True
    thread.start()
    
    return jsonify({'success': True, 'message': f'Started backtest for {symbol}'})

@app.route('/api/stop-backtest', methods=['POST'])
def stop_backtest():
    """Stop current backtest"""
    backtester.is_running = False
    return jsonify({'success': True, 'message': 'Backtest stopped'})

# Market Overview API
@app.route('/api/market-overview')
def get_market_overview():
    """Get market overview data for NSE"""
    nifty_data = {
        "indices": [
            {"name": "NIFTY 50", "value": 22150.65, "change": 185.30, "change_pct": 0.84},
            {"name": "SENSEX", "value": 73798.40, "change": 568.90, "change_pct": 0.78},
            {"name": "NIFTY BANK", "value": 46420.15, "change": 125.80, "change_pct": 0.27}
        ],
        "top_gainers": [
            {"symbol": "RELIANCE", "price": 2865.40, "change": 2.15},
            {"symbol": "INFY", "price": 1875.20, "change": 1.89},
            {"symbol": "TCS", "price": 4215.80, "change": 1.45}
        ],
        "top_losers": [
            {"symbol": "HDFCBANK", "price": 1658.30, "change": -0.98},
            {"symbol": "ITC", "price": 482.15, "change": -0.65},
            {"symbol": "KOTAKBANK", "price": 1742.50, "change": -0.43}
        ]
    }
    return jsonify(nifty_data)

# Portfolio API
@app.route('/api/portfolio')
def get_portfolio():
    """Get portfolio data"""
    portfolio_data = {
        "holdings": [
            {"symbol": "RELIANCE", "quantity": 100, "avg_price": 2800.00, "current_price": 2865.40, "pnl": 6540.00},
            {"symbol": "INFY", "quantity": 50, "avg_price": 1850.00, "current_price": 1875.20, "pnl": 1260.00},
            {"symbol": "TCS", "quantity": 25, "avg_price": 4100.00, "current_price": 4215.80, "pnl": 2895.00}
        ],
        "total_value": 485670.00,
        "total_pnl": 10695.00,
        "day_pnl": 3240.50
    }
    return jsonify(portfolio_data)

# Watchlist API
@app.route('/api/watchlist')
def get_watchlist():
    """Get watchlist data"""
    watchlist_data = [
        {"symbol": "SBIN", "price": 825.40, "change": 0.65, "change_pct": 0.08},
        {"symbol": "BHARTIARTL", "price": 1528.90, "change": 8.90, "change_pct": 0.59},
        {"symbol": "LT", "price": 3615.25, "change": 15.25, "change_pct": 0.42},
        {"symbol": "ASIANPAINT", "price": 2945.80, "change": -4.20, "change_pct": -0.14}
    ]
    return jsonify(watchlist_data)

# Order placement API
@app.route('/api/place-order', methods=['POST'])
def place_order():
    """Place a trading order"""
    data = request.get_json()
    return jsonify({
        'success': True,
        'order_id': f"ORD_{int(time.time())}",
        'message': f"Order placed for {data.get('symbol')} - {data.get('side')} {data.get('quantity')} @ ₹{data.get('price')}"
    })

# HFT Bot API Endpoints
@app.route('/api/hft/start', methods=['POST'])
def start_hft_bot():
    """Start HFT bot for specified symbol"""
    data = request.get_json()
    symbol = data.get('symbol', 'RELIANCE')
    
    try:
        bot = get_or_create_bot(symbol)
        if not bot.is_running:
            bot.start()
            return jsonify({
                'success': True,
                'message': f'HFT Bot started for {symbol}',
                'symbol': symbol
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Bot is already running'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/hft/stop', methods=['POST'])
def stop_hft_bot():
    """Stop HFT bot"""
    from hft_trading_bot import hft_bot
    if hft_bot and hft_bot.is_running:
        hft_bot.stop()
        return jsonify({
            'success': True,
            'message': 'HFT Bot stopped'
        })
    return jsonify({
        'success': False,
        'message': 'No active bot to stop'
    })

@app.route('/api/hft/status')
def get_hft_status():
    """Get HFT bot status and real-time data"""
    from hft_trading_bot import hft_bot
    if hft_bot:
        if hft_bot.is_running:
            return jsonify({
                'status': 'RUNNING',
                'data': hft_bot.get_real_time_data()
            })
        else:
            # Return some dummy data even when stopped for chart display
            return jsonify({
                'status': 'STOPPED',
                'data': hft_bot.get_real_time_data() if hasattr(hft_bot, 'get_real_time_data') else {
                    'market_data': {'price': 2850.0, 'volume': 1000},
                    'performance': {'total_pnl': 0, 'win_rate': 0, 'total_trades': 0},
                    'charts': {
                        'price_history': [2850.0] * 10,
                        'pnl_history': [0] * 10,
                        'volatility_history': [0.001] * 10,
                        'timestamps': [time.time() - i for i in range(10, 0, -1)]
                    },
                    'order_book': {
                        'bids': [[2849.95, 100], [2849.90, 200]],
                        'asks': [[2850.05, 100], [2850.10, 200]]
                    },
                    'recent_trades': []
                }
            })
    else:
        return jsonify({
            'status': 'STOPPED',
            'data': {
                'market_data': {'price': 2850.0, 'volume': 1000},
                'performance': {'total_pnl': 0, 'win_rate': 0, 'total_trades': 0},
                'charts': {
                    'price_history': [2850.0] * 10,
                    'pnl_history': [0] * 10,
                    'volatility_history': [0.001] * 10,
                    'timestamps': [time.time() - i for i in range(10, 0, -1)]
                },
                'order_book': {
                    'bids': [[2849.95, 100], [2849.90, 200]],
                    'asks': [[2850.05, 100], [2850.10, 200]]
                },
                'recent_trades': []
            }
        })

@app.route('/api/hft/performance')
def get_hft_performance():
    """Get detailed HFT performance metrics"""
    from hft_trading_bot import hft_bot
    if hft_bot:
        stats = hft_bot.get_performance_stats()
        return jsonify(stats)
    return jsonify({})

@app.route('/api/hft/charts')
def get_hft_charts():
    """Get chart data for HFT bot"""
    from hft_trading_bot import hft_bot
    if hft_bot:
        chart_data = hft_bot.get_real_time_data().get('charts', {})
        return jsonify(chart_data)
    return jsonify({})

@app.route('/api/hft/order-book')
def get_hft_order_book():
    """Get live order book data"""
    from hft_trading_bot import hft_bot
    if hft_bot and hft_bot.current_market_data:
        return jsonify({
            'bids': hft_bot.current_market_data.order_book_bids,
            'asks': hft_bot.current_market_data.order_book_asks,
            'spread': hft_bot.current_market_data.ask_price - hft_bot.current_market_data.bid_price
        })
    return jsonify({
        'bids': [[2849.95, 100], [2849.90, 200], [2849.85, 150]],
        'asks': [[2850.05, 100], [2850.10, 200], [2850.15, 150]],
        'spread': 0.10
    })

@app.route('/api/hft/trades')
def get_hft_trades():
    """Get recent trades from HFT bot"""
    from hft_trading_bot import hft_bot
    if hft_bot:
        recent_trades = [
            {
                'timestamp': trade.timestamp,
                'side': trade.side,
                'price': trade.price,
                'quantity': trade.quantity,
                'pnl': getattr(trade, 'pnl', 0)
            }
            for trade in hft_bot.trade_history[-20:]  # Last 20 trades
        ]
        return jsonify(recent_trades)
    return jsonify([])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)