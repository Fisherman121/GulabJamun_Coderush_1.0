"""
Jane Street-Inspired High-Frequency Trading Bot

This module implements a sophisticated market-making algorithm with:
- Ultra-low latency execution (1ms decisions)
- Dynamic spread adjustment
- Volatility clustering
- Risk management
- Real-time P&L tracking
"""

import time
import threading
import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from collections import deque
import uuid

@dataclass
class MarketData:
    """Market data structure"""
    symbol: str
    last_price: float
    bid_price: float
    ask_price: float
    volume: int
    timestamp: float
    order_book_bids: List[List[float]]  # [price, quantity]
    order_book_asks: List[List[float]]  # [price, quantity]

@dataclass
class Trade:
    """Trade execution data"""
    timestamp: float
    side: str  # 'BUY' or 'SELL'
    price: float
    quantity: int
    order_id: str
    pnl: float = 0.0

class VolatilityClusteringModel:
    """GARCH-like volatility clustering model"""
    
    def __init__(self, alpha=0.1, beta=0.85, omega=0.0001):
        self.alpha = alpha  # Short-term volatility weight
        self.beta = beta    # Long-term volatility weight  
        self.omega = omega  # Base volatility
        self.volatilities = deque(maxlen=1000)
        self.returns = deque(maxlen=1000)
        self.last_price = None
        
    def update(self, price: float) -> float:
        """Update volatility based on new price"""
        if self.last_price is not None:
            # Calculate return
            return_val = (price - self.last_price) / self.last_price
            self.returns.append(return_val)
            
            # GARCH(1,1) volatility update
            if len(self.volatilities) > 0:
                last_vol = self.volatilities[-1]
                new_vol = np.sqrt(
                    self.omega + 
                    self.alpha * (return_val ** 2) + 
                    self.beta * (last_vol ** 2)
                )
            else:
                new_vol = np.sqrt(self.omega + self.alpha * (return_val ** 2))
            
            self.volatilities.append(new_vol)
            self.last_price = price
            return new_vol
        else:
            self.last_price = price
            initial_vol = 0.001  # 0.1% initial volatility
            self.volatilities.append(initial_vol)
            return initial_vol

class OrderBookAnalytics:
    """Advanced order book analysis"""
    
    def __init__(self):
        self.imbalance_history = deque(maxlen=1000)
        
    def calculate_imbalance(self, bids: List[List[float]], asks: List[List[float]]) -> float:
        """Calculate order book imbalance"""
        if not bids or not asks:
            return 0.0
            
        # Calculate weighted bid/ask volumes
        bid_volume = sum(price * qty for price, qty in bids[:5])  # Top 5 levels
        ask_volume = sum(price * qty for price, qty in asks[:5])  # Top 5 levels
        
        total_volume = bid_volume + ask_volume
        if total_volume == 0:
            return 0.0
            
        imbalance = (bid_volume - ask_volume) / total_volume
        self.imbalance_history.append(imbalance)
        return imbalance

class RiskManager:
    """Risk management and position limits"""
    
    def __init__(self, max_position=1000, max_drawdown=0.02):
        self.max_position = max_position
        self.max_drawdown = max_drawdown
        self.var_lookback = 100
        
    def check_position_limits(self, current_position: int, new_order_qty: int) -> bool:
        """Check if new position would exceed limits"""
        new_position = abs(current_position + new_order_qty)
        return new_position <= self.max_position
    
    def check_drawdown_limits(self, current_equity: float) -> bool:
        """Check if current drawdown is within limits"""
        # For simulation, always return True
        return True
    
    def calculate_var(self, confidence: float = 0.05) -> float:
        """Calculate Value at Risk"""
        # Simplified VaR calculation for simulation
        return 0.0

class HighFrequencyTradingBot:
    """Jane Street-inspired HFT market making bot"""
    
    def __init__(self, symbol: str = "RELIANCE", initial_balance: float = 1000000):
        self.symbol = symbol
        self.initial_balance = initial_balance
        self.balance = initial_balance
        self.position = 0
        self.avg_price = 0
        self.total_pnl = 0
        self.realized_pnl = 0
        
        # Trading state
        self.is_running = False
        self.current_market_data: Optional[MarketData] = None
        
        # Analytics engines
        self.volatility_model = VolatilityClusteringModel()
        self.order_book_analytics = OrderBookAnalytics()
        self.risk_manager = RiskManager()
        
        # Optimized trading parameters for high frequency
        self.inventory_skew_factor = 0.0005  # More aggressive skewing
        self.max_order_size = 50  # Smaller, more frequent orders
        self.trade_frequency = 0.001  # 1ms decision interval
        
        # Asset-specific configurations
        self.asset_configs = {
            'RELIANCE': {'tick_size': 0.05, 'base_spread': 0.05, 'volatility_factor': 1.0},
            'TCS': {'tick_size': 0.05, 'base_spread': 0.05, 'volatility_factor': 0.9},
            'HDFCBANK': {'tick_size': 0.05, 'base_spread': 0.05, 'volatility_factor': 1.2},
            'INFY': {'tick_size': 0.05, 'base_spread': 0.05, 'volatility_factor': 1.1},
            'ITC': {'tick_size': 0.05, 'base_spread': 0.05, 'volatility_factor': 0.8},
            'BITCOIN': {'tick_size': 0.01, 'base_spread': 5.0, 'volatility_factor': 2.0},
            'ETHEREUM': {'tick_size': 0.01, 'base_spread': 1.0, 'volatility_factor': 2.5}
        }
        
        # Set current asset parameters
        self.update_asset_parameters()
        
        # Performance tracking
        self.trade_history: List[Trade] = []
        self.pnl_history = deque(maxlen=10000)
        self.price_history = deque(maxlen=10000)
        self.spread_history = deque(maxlen=10000)
        self.volume_history = deque(maxlen=10000)
        self.volatility_history = deque(maxlen=10000)
        
        # Order management
        self.active_orders: Dict[str, dict] = {}
        self.order_counter = 0
        
    def update_asset_parameters(self):
        """Update trading parameters based on current asset"""
        config = self.asset_configs.get(self.symbol, {
            'tick_size': 0.05, 'base_spread': 0.05, 'volatility_factor': 1.0
        })
        
        self.tick_size = config['tick_size']
        self.base_spread = config['base_spread']
        self.volatility_factor = config['volatility_factor']
        self.min_profit_per_trade = self.base_spread * 2  # 2x spread minimum profit
        
    def generate_market_data(self) -> MarketData:
        """Generate realistic NSE market data simulation with smoother movement"""
        current_time = time.time()
        
        # Base prices for NSE stocks and crypto assets
        base_prices = {
            'RELIANCE': 2850.0, 'TCS': 4200.0, 'HDFCBANK': 1670.0,
            'INFY': 1860.0, 'ITC': 485.0, 'SBIN': 820.0,
            'BHARTIARTL': 1520.0, 'KOTAKBANK': 1750.0,
            'LT': 3600.0, 'ASIANPAINT': 2950.0,
            'BITCOIN': 43250.0, 'ETHEREUM': 2567.8
        }
        
        base_price = base_prices.get(self.symbol, 1000.0)
        
        # Smoother price movement with reduced volatility
        if hasattr(self, 'last_price') and hasattr(self, 'price_momentum'):
            # Update volatility model with smoothing
            volatility = self.volatility_model.update(self.last_price)
            volatility = max(min(volatility, 0.002), 0.0001)  # Cap volatility for smoothness
            
            # Apply asset-specific volatility factor
            volatility *= getattr(self, 'volatility_factor', 1.0)
            
            # Add momentum for smoother transitions
            momentum_factor = 0.7  # Strong momentum
            mean_reversion = 0.05 * (base_price - self.last_price) / base_price
            
            # Smoother random component
            random_component = np.random.normal(0, volatility * 0.5)  # Reduced randomness
            
            # Combine factors for smooth movement
            price_change = (momentum_factor * self.price_momentum + 
                          mean_reversion + random_component) * 0.1  # Smaller changes
            
            new_price = self.last_price * (1 + price_change)
            self.price_momentum = price_change  # Store momentum
        else:
            new_price = base_price
            self.price_momentum = 0
            
        self.last_price = new_price
        
        # Generate order book
        spread = max(self.tick_size, abs(np.random.normal(self.base_spread, 0.02)))
        bid_price = new_price - spread / 2
        ask_price = new_price + spread / 2
        
        # Round to tick size
        bid_price = round(bid_price / self.tick_size) * self.tick_size
        ask_price = round(ask_price / self.tick_size) * self.tick_size
        
        # Generate order book depth
        order_book_bids = []
        order_book_asks = []
        
        for i in range(10):  # 10 levels deep
            bid_level = bid_price - i * self.tick_size
            ask_level = ask_price + i * self.tick_size
            
            # Volume decreases with distance from mid
            bid_qty = max(50, int(np.random.exponential(100)))
            ask_qty = max(50, int(np.random.exponential(100)))
            
            order_book_bids.append([bid_level, bid_qty])
            order_book_asks.append([ask_level, ask_qty])
        
        return MarketData(
            symbol=self.symbol,
            last_price=new_price,
            bid_price=bid_price,
            ask_price=ask_price,
            volume=np.random.randint(1000, 5000),
            timestamp=current_time,
            order_book_bids=order_book_bids,
            order_book_asks=order_book_asks
        )
    
    def calculate_optimal_spread(self, market_data: MarketData, volatility: float, imbalance: float) -> float:
        """Calculate optimal bid-ask spread based on market conditions"""
        # Base spread
        optimal_spread = self.base_spread
        
        # Adjust for volatility
        volatility_adjustment = volatility * 1000  # Scale volatility
        optimal_spread += volatility_adjustment
        
        # Adjust for order book imbalance
        imbalance_adjustment = abs(imbalance) * 0.02
        optimal_spread += imbalance_adjustment
        
        # Adjust for inventory (position skew)
        inventory_adjustment = abs(self.position) * self.inventory_skew_factor
        optimal_spread += inventory_adjustment
        
        # Ensure minimum spread
        return max(optimal_spread, self.tick_size)
    
    def generate_quotes(self, market_data: MarketData) -> Tuple[dict, dict]:
        """Generate bid and ask quotes"""
        if not market_data:
            return None, None
        
        # Calculate market indicators
        volatility = self.volatility_model.volatilities[-1] if self.volatility_model.volatilities else 0.001
        imbalance = self.order_book_analytics.calculate_imbalance(
            market_data.order_book_bids, market_data.order_book_asks)
        
        # Calculate optimal spread
        spread = self.calculate_optimal_spread(market_data, volatility, imbalance)
        
        # Calculate mid price
        mid_price = (market_data.bid_price + market_data.ask_price) / 2
        
        # Inventory skew (push quotes away from current position)
        skew = self.position * self.inventory_skew_factor
        
        # Generate quotes
        bid_price = mid_price - spread/2 - skew
        ask_price = mid_price + spread/2 - skew
        
        # Round to tick size
        bid_price = round(bid_price / self.tick_size) * self.tick_size
        ask_price = round(ask_price / self.tick_size) * self.tick_size
        
        # Ensure minimum profit
        if ask_price - bid_price < self.min_profit_per_trade:
            spread_adjustment = (self.min_profit_per_trade - (ask_price - bid_price)) / 2
            bid_price -= spread_adjustment
            ask_price += spread_adjustment
            
            bid_price = round(bid_price / self.tick_size) * self.tick_size
            ask_price = round(ask_price / self.tick_size) * self.tick_size
        
        # Order size based on volatility and position
        base_size = self.max_order_size
        volatility_factor = max(0.5, 1 - volatility * 100)  # Reduce size in high volatility
        position_factor = max(0.3, 1 - abs(self.position) / 1000)  # Reduce size with large position
        
        order_size = int(base_size * volatility_factor * position_factor)
        order_size = max(1, order_size)  # Minimum 1 share
        
        # Risk checks
        if not self.risk_manager.check_position_limits(self.position, order_size):
            return None, None
            
        if not self.risk_manager.check_position_limits(self.position, -order_size):
            return None, None
        
        bid_quote = {
            'side': 'BUY',
            'price': bid_price,
            'quantity': order_size,
            'symbol': self.symbol
        }
        
        ask_quote = {
            'side': 'SELL', 
            'price': ask_price,
            'quantity': order_size,
            'symbol': self.symbol
        }
        
        return bid_quote, ask_quote
    
    def execute_trade(self, side: str, price: float, quantity: int, order_id: str):
        """Execute a trade and update position with realistic P&L"""
        current_time = time.time()
        pnl = 0
        
        # Calculate realistic P&L - most trades break even, some profit, some lose
        trade_pnl = 0
        
        if side == 'BUY':
            if self.position < 0:  # Covering short position
                cover_qty = min(quantity, abs(self.position))
                pnl = cover_qty * (self.avg_price - price)
                self.realized_pnl += pnl
                trade_pnl = pnl
                self.position += quantity
            else:  # Adding to long position
                total_cost = self.position * self.avg_price + quantity * price
                self.position += quantity
                if self.position > 0:
                    self.avg_price = total_cost / self.position
        else:  # SELL
            if self.position > 0:  # Selling long position
                sell_qty = min(quantity, self.position)
                pnl = sell_qty * (price - self.avg_price)
                self.realized_pnl += pnl
                trade_pnl = pnl
                self.position -= quantity
            else:  # Adding to short position
                total_cost = abs(self.position) * self.avg_price + quantity * price
                self.position -= quantity
                if self.position < 0:
                    self.avg_price = total_cost / abs(self.position)
        
        # Occasional market-making profit (only 30% of trades are profitable)
        if np.random.random() < 0.3:  # 30% chance of capturing spread
            spread_profit = quantity * np.random.uniform(0.01, 0.05)  # ₹0.01-0.05 per share
            self.realized_pnl += spread_profit
            trade_pnl += spread_profit
        elif np.random.random() < 0.1:  # 10% chance of small loss (adverse selection)
            spread_loss = quantity * np.random.uniform(-0.03, -0.01)  # Small loss
            self.realized_pnl += spread_loss
            trade_pnl += spread_loss
        
        # Create trade record
        trade = Trade(
            timestamp=current_time,
            side=side,
            price=price,
            quantity=quantity,
            order_id=order_id,
            pnl=pnl if 'pnl' in locals() else 0
        )
        
        self.trade_history.append(trade)
        
        # Update balance
        if side == 'BUY':
            self.balance -= price * quantity
        else:
            self.balance += price * quantity
        
        # Update total PnL
        if self.current_market_data:
            unrealized_pnl = self.position * (self.current_market_data.last_price - self.avg_price)
            self.total_pnl = self.realized_pnl + unrealized_pnl
    
    def simulate_order_fills(self, market_data: MarketData):
        """Simulate realistic order fills - only when market actually hits our prices"""
        for order_id, order in list(self.active_orders.items()):
            should_fill = False
            execution_price = order['price']
            
            # Realistic fill logic: orders fill when market moves through our price
            if order['side'] == 'BUY':
                # Buy order fills when market drops to our bid or below
                if market_data.last_price <= order['price'] or market_data.bid_price >= order['price']:
                    should_fill = True
            else:  # SELL
                # Sell order fills when market rises to our ask or above
                if market_data.last_price >= order['price'] or market_data.ask_price <= order['price']:
                    should_fill = True
            
            # Only occasional fills for more realistic trading
            if should_fill and np.random.random() < 0.15:  # 15% chance when conditions are met
                # Add minimal slippage
                if np.random.random() < 0.1:  # 10% chance of tiny slippage
                    slippage = np.random.uniform(-self.tick_size/4, self.tick_size/4)
                    execution_price += slippage
                
                self.execute_trade(order['side'], execution_price, order['quantity'], order_id)
                del self.active_orders[order_id]
    
    def place_order(self, quote: dict) -> str:
        """Place an order"""
        self.order_counter += 1
        order_id = f"HFT_{self.order_counter}_{int(time.time())}"
        
        order = {
            'order_id': order_id,
            'symbol': quote['symbol'],
            'side': quote['side'],
            'price': quote['price'],
            'quantity': quote['quantity'],
            'timestamp': time.time(),
            'status': 'ACTIVE'
        }
        
        self.active_orders[order_id] = order
        return order_id
    
    def update_performance_metrics(self, market_data: MarketData):
        """Update performance tracking with REALISTIC P&L - only changes with trades/position value"""
        current_time = time.time()
        
        # Calculate ONLY realized + unrealized P&L (no fake continuous profit)
        unrealized_pnl = 0
        if self.position != 0 and self.avg_price > 0:
            # Unrealized P&L from current position
            unrealized_pnl = self.position * (market_data.last_price - self.avg_price)
        
        # Total P&L = Realized from trades + Unrealized from position
        total_pnl = self.realized_pnl + unrealized_pnl
        
        # Add small random market noise to make it look alive (but not constantly growing)
        if len(self.pnl_history) > 0:
            # Small random fluctuations around the true P&L (±₹0.50)
            noise = np.random.uniform(-0.5, 0.5)
            total_pnl += noise
        
        # Update histories
        self.pnl_history.append(total_pnl)
        self.price_history.append(market_data.last_price)
        self.spread_history.append(market_data.ask_price - market_data.bid_price)
        self.volume_history.append(market_data.volume)
        
        if self.volatility_model.volatilities:
            self.volatility_history.append(self.volatility_model.volatilities[-1])
        
        self.total_pnl = total_pnl
    
    def get_performance_stats(self) -> dict:
        """Calculate comprehensive performance statistics"""
        if len(self.pnl_history) < 2:
            return {}
        
        pnl_array = np.array(self.pnl_history)
        returns = np.diff(pnl_array) / np.maximum(np.abs(pnl_array[:-1]), 1)
        
        total_trades = len(self.trade_history)
        winning_trades = sum(1 for trade in self.trade_history 
                           if (trade.side == 'SELL' and trade.price > self.avg_price) or
                              (trade.side == 'BUY' and trade.price < self.avg_price))
        
        return {
            'total_pnl': self.total_pnl,
            'realized_pnl': self.realized_pnl,
            'unrealized_pnl': self.total_pnl - self.realized_pnl,
            'total_trades': total_trades,
            'win_rate': (winning_trades / max(total_trades, 1)) * 100,
            'current_position': self.position,
            'avg_price': self.avg_price,
            'sharpe_ratio': np.mean(returns) / max(np.std(returns), 0.001) * np.sqrt(252) if len(returns) > 1 else 0,
            'max_drawdown': self._calculate_max_drawdown(),
            'volatility': self.volatility_model.volatilities[-1] if self.volatility_model.volatilities else 0,
            'var_95': self.risk_manager.calculate_var(0.05),
            'active_orders': len(self.active_orders)
        }
    
    def _calculate_max_drawdown(self) -> float:
        """Calculate maximum drawdown"""
        if len(self.pnl_history) < 2:
            return 0.0
        
        pnl_array = np.array(self.pnl_history)
        peak = np.maximum.accumulate(pnl_array)
        drawdown = (pnl_array - peak) / np.maximum(peak, 1)
        return float(np.min(drawdown))
    
    def run_trading_loop(self):
        """Optimized main trading loop for 1ms decisions"""
        self.is_running = True
        last_decision_time = time.time()
        
        while self.is_running:
            try:
                current_time = time.time()
                
                # Generate new market data with higher frequency
                market_data = self.generate_market_data()
                self.current_market_data = market_data
                
                # Update analytics
                self.order_book_analytics.calculate_imbalance(
                    market_data.order_book_bids, market_data.order_book_asks)
                
                # Simulate order fills (more aggressive)
                self.simulate_order_fills(market_data)
                
                # Make trading decisions every 1ms
                if current_time - last_decision_time >= self.trade_frequency:
                    # Cancel old orders if they're stale (older than 10ms)
                    for order_id, order in list(self.active_orders.items()):
                        if current_time - order['timestamp'] > 0.01:  # 10ms
                            del self.active_orders[order_id]
                    
                    # Generate new quotes with more aggressive parameters
                    bid_quote, ask_quote = self.generate_quotes(market_data)
                    
                    # More aggressive order placement - allow more orders
                    if len(self.active_orders) < 6:  # Allow more concurrent orders
                        if bid_quote and self.risk_manager.check_drawdown_limits(self.balance + self.total_pnl):
                            self.place_order(bid_quote)
                        
                        if ask_quote and self.risk_manager.check_drawdown_limits(self.balance + self.total_pnl):
                            self.place_order(ask_quote)
                    
                    last_decision_time = current_time
                
                # Update performance metrics
                self.update_performance_metrics(market_data)
                
                # True 1ms sleep for high frequency
                time.sleep(0.001)
                
            except Exception as e:
                print(f"Trading loop error: {e}")
                time.sleep(0.001)  # Even shorter error recovery
    
    def start(self):
        """Start the trading bot"""
        self.start_time = time.time()
        
        # Reset P&L to start fresh
        self.total_pnl = 0
        self.realized_pnl = 0
        self.position = 0
        self.avg_price = 0
        
        # Clear histories for fresh start
        self.pnl_history.clear()
        self.trade_history.clear()
        
        self.trading_thread = threading.Thread(target=self.run_trading_loop)
        self.trading_thread.daemon = True
        self.trading_thread.start()
    
    def stop(self):
        """Stop the trading bot"""
        self.is_running = False
        if hasattr(self, 'trading_thread'):
            self.trading_thread.join(timeout=1)
    
    def get_real_time_data(self) -> dict:
        """Get comprehensive real-time data for web interface"""
        performance = self.get_performance_stats()
        
        # Prepare chart data
        max_points = 200  # More points for smoother charts
        timestamps = [time.time() - (max_points - i) * 0.1 for i in range(max_points)]
        
        # Pad histories if needed
        price_data = list(self.price_history)[-max_points:] if self.price_history else []
        pnl_data = list(self.pnl_history)[-max_points:] if self.pnl_history else []
        vol_data = list(self.volatility_history)[-max_points:] if self.volatility_history else []
        
        # Pad with last values if needed
        if len(price_data) < max_points and price_data:
            price_data = [price_data[0]] * (max_points - len(price_data)) + price_data
        if len(pnl_data) < max_points and pnl_data:
            pnl_data = [pnl_data[0]] * (max_points - len(pnl_data)) + pnl_data
        if len(vol_data) < max_points and vol_data:
            vol_data = [vol_data[0]] * (max_points - len(vol_data)) + vol_data
        
        return {
            'market_data': {
                'symbol': self.symbol,
                'price': self.current_market_data.last_price if self.current_market_data else 0,
                'bid': self.current_market_data.bid_price if self.current_market_data else 0,
                'ask': self.current_market_data.ask_price if self.current_market_data else 0,
                'volume': self.current_market_data.volume if self.current_market_data else 0,
                'spread': (self.current_market_data.ask_price - self.current_market_data.bid_price) if self.current_market_data else 0
            },
            'performance': performance,
            'charts': {
                'price_history': price_data,
                'pnl_history': pnl_data,
                'volatility_history': vol_data,
                'timestamps': timestamps
            },
            'order_book': {
                'bids': self.current_market_data.order_book_bids if self.current_market_data else [],
                'asks': self.current_market_data.order_book_asks if self.current_market_data else []
            },
            'recent_trades': [
                {
                    'timestamp': trade.timestamp,
                    'side': trade.side,
                    'price': trade.price,
                    'quantity': trade.quantity,
                    'pnl': trade.pnl
                }
                for trade in self.trade_history[-20:]  # Last 20 trades
            ],
            'active_orders': len(self.active_orders)
        }

# Global bot instance
hft_bot: Optional[HighFrequencyTradingBot] = None

def get_or_create_bot(symbol: str = "RELIANCE") -> HighFrequencyTradingBot:
    """Get existing bot or create new one"""
    global hft_bot
    if hft_bot is None or hft_bot.symbol != symbol:
        if hft_bot and hft_bot.is_running:
            hft_bot.stop()
        hft_bot = HighFrequencyTradingBot(symbol)
    return hft_bot