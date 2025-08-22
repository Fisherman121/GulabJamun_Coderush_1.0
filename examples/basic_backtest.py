"""
Basic HFT Backtesting Example

This example demonstrates the minimal setup required for backtesting
a simple market making strategy.
"""

from hftbacktest import (
    BacktestAsset, 
    HashMapMarketDepthBacktest, 
    BUY, SELL, GTX, LIMIT
)
import numpy as np


def simple_market_making_strategy(hbt):
    """
    Simple market making strategy that places orders around mid price
    """
    asset_no = 0
    tick_size = hbt.depth(asset_no).tick_size
    lot_size = hbt.depth(asset_no).lot_size
    
    # Main trading loop
    while hbt.elapse(10_000_000) == 0:  # 10ms intervals
        
        # Cancel existing orders
        hbt.clear_inactive_orders(asset_no)
        
        # Get current market data
        best_bid = hbt.depth(asset_no).best_bid
        best_ask = hbt.depth(asset_no).best_ask
        
        if best_bid > 0 and best_ask > 0:
            mid_price = (best_bid + best_ask) / 2.0
            spread = 2 * tick_size  # Minimum 2-tick spread
            
            # Place buy order
            buy_price = mid_price - spread / 2
            buy_price = round(buy_price / tick_size) * tick_size
            
            # Place sell order  
            sell_price = mid_price + spread / 2
            sell_price = round(sell_price / tick_size) * tick_size
            
            order_qty = lot_size * 10  # Order 10 lots
            
            # Submit orders
            hbt.submit_buy_order(asset_no, 0, buy_price, order_qty, GTX, LIMIT, False)
            hbt.submit_sell_order(asset_no, 1, sell_price, order_qty, GTX, LIMIT, False)
    
    return True


def run_backtest():
    """
    Run the backtest with sample configuration
    """
    
    # Note: You'll need actual market data file for this to work
    # This is just a template showing the structure
    
    try:
        # Configure asset for backtesting
        asset = (
            BacktestAsset()
                .data(['sample_data.gz'])  # Replace with actual data file
                .linear_asset(1.0)
                .power_prob_queue_model(2.0) 
                .no_partial_fill_exchange()
                .trading_value_fee_model(-0.00005, 0.0007)
                .tick_size(0.01)
                .lot_size(0.001)
        )
        
        # Create backtester
        hbt = HashMapMarketDepthBacktest([asset])
        
        # Run strategy
        simple_market_making_strategy(hbt)
        
        # Print results
        print(f"Final balance: {hbt.balance(0):.2f}")
        print(f"Final position: {hbt.position(0):.3f}")
        
        return hbt
        
    except Exception as e:
        print(f"Backtest failed: {e}")
        print("Make sure you have valid market data files in the correct format")
        return None


if __name__ == "__main__":
    print("Starting basic HFT backtest...")
    result = run_backtest()
    if result:
        print("Backtest completed successfully!")
    else:
        print("Backtest failed - check data files and configuration")
