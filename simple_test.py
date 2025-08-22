import numpy as np

# Test basic hftbacktest import and functionality
try:
    from hftbacktest import BacktestAsset, HashMapMarketDepthBacktest, BUY, SELL, GTX, LIMIT
    print("✓ Successfully imported hftbacktest modules")
except ImportError as e:
    print(f"✗ Failed to import hftbacktest: {e}")
    exit(1)

# Test creating a simple asset configuration
try:
    asset = (
        BacktestAsset()
            .data(['examples/spot/btcusdt_20240808.gz'])
            .linear_asset(1.0)
            .power_prob_queue_model(2.0)
            .no_partial_fill_exchange()
            .trading_value_fee_model(-0.00005, 0.0007)
            .tick_size(0.01)
            .lot_size(0.001)
    )
    print("✓ Successfully created BacktestAsset configuration")
except Exception as e:
    print(f"✗ Failed to create asset: {e}")
    exit(1)

# Test creating the backtester
try:
    hbt = HashMapMarketDepthBacktest([asset])
    print("✓ Successfully created HashMapMarketDepthBacktest")
except Exception as e:
    print(f"✗ Failed to create backtester: {e}")
    exit(1)

# Test basic functionality
try:
    print(f"✓ Tick size: {hbt.depth(0).tick_size}")
    print(f"✓ Lot size: {hbt.depth(0).lot_size}")
    print(f"✓ Best bid: {hbt.depth(0).best_bid}")
    print(f"✓ Best ask: {hbt.depth(0).best_ask}")
    print(f"✓ Position: {hbt.position(0)}")
    print(f"✓ Balance: {hbt.balance(0)}")
except Exception as e:
    print(f"✗ Failed to access basic data: {e}")
    exit(1)

print("🎉 Basic hftbacktest functionality is working!")
print("\nNext steps:")
print("1. The core system is functional")
print("2. We can proceed to create a market making algorithm")
print("3. We'll need to handle the numba dependency for JIT compilation")
