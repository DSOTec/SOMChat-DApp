// Alternative Price Feed Methods for Console
// Run with: node scripts/alternativePriceFeeds.js

const https = require('https');

console.log("=== Alternative Price Feed Console ===\n");

// Method 1: CoinGecko API (Free, no API key needed)
function getCoinGeckoPrices() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.coingecko.com',
            port: 443,
            path: '/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin&vs_currencies=usd',
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const prices = JSON.parse(data);
                    resolve(prices);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

// Method 2: Binance API (Free, no API key needed)
function getBinancePrices() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.binance.com',
            port: 443,
            path: '/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","BNBUSDT"]',
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const prices = JSON.parse(data);
                    resolve(prices);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

// Method 3: Mock price data (for testing when offline)
function getMockPrices() {
    const baseTime = Date.now();
    const btcBase = 45000;
    const ethBase = 3000;
    const bnbBase = 300;
    
    // Add some random variation
    const variation = () => (Math.random() - 0.5) * 0.1; // ±5% variation
    
    return {
        bitcoin: { usd: btcBase * (1 + variation()) },
        ethereum: { usd: ethBase * (1 + variation()) },
        binancecoin: { usd: bnbBase * (1 + variation()) },
        timestamp: new Date().toISOString()
    };
}

// Main function to get prices
async function getPrices() {
    console.log("🔍 Fetching cryptocurrency prices...\n");
    
    // Try CoinGecko first
    try {
        console.log("📊 Method 1: CoinGecko API");
        const coinGeckoData = await getCoinGeckoPrices();
        
        console.log(`💰 BTC/USD: $${coinGeckoData.bitcoin.usd.toLocaleString()}`);
        console.log(`💰 ETH/USD: $${coinGeckoData.ethereum.usd.toLocaleString()}`);
        console.log(`💰 BNB/USD: $${coinGeckoData.binancecoin.usd.toLocaleString()}`);
        
        // Calculate ratios
        const btcEthRatio = (coinGeckoData.bitcoin.usd / coinGeckoData.ethereum.usd).toFixed(4);
        const bnbEthRatio = (coinGeckoData.binancecoin.usd / coinGeckoData.ethereum.usd).toFixed(4);
        
        console.log(`📈 BTC/ETH: ${btcEthRatio}`);
        console.log(`📈 BNB/ETH: ${bnbEthRatio}`);
        console.log(`⏰ Updated: ${new Date().toISOString()}\n`);
        
        return;
    } catch (error) {
        console.log("❌ CoinGecko failed:", error.message);
    }
    
    // Try Binance as backup
    try {
        console.log("📊 Method 2: Binance API");
        const binanceData = await getBinancePrices();
        
        binanceData.forEach(item => {
            const symbol = item.symbol;
            const price = parseFloat(item.price);
            
            if (symbol === 'BTCUSDT') {
                console.log(`💰 BTC/USD: $${price.toLocaleString()}`);
            } else if (symbol === 'ETHUSDT') {
                console.log(`💰 ETH/USD: $${price.toLocaleString()}`);
            } else if (symbol === 'BNBUSDT') {
                console.log(`💰 BNB/USD: $${price.toLocaleString()}`);
            }
        });
        
        console.log(`⏰ Updated: ${new Date().toISOString()}\n`);
        return;
    } catch (error) {
        console.log("❌ Binance failed:", error.message);
    }
    
    // Use mock data as final fallback
    console.log("📊 Method 3: Mock Data (for testing)");
    const mockData = getMockPrices();
    
    console.log(`💰 BTC/USD: $${mockData.bitcoin.usd.toLocaleString()} (mock)`);
    console.log(`💰 ETH/USD: $${mockData.ethereum.usd.toLocaleString()} (mock)`);
    console.log(`💰 BNB/USD: $${mockData.binancecoin.usd.toLocaleString()} (mock)`);
    console.log(`⏰ Generated: ${mockData.timestamp}\n`);
}

// Continuous price monitoring (optional)
function startPriceMonitoring(intervalSeconds = 30) {
    console.log(`🔄 Starting price monitoring (updates every ${intervalSeconds} seconds)`);
    console.log("Press Ctrl+C to stop\n");
    
    getPrices(); // Get initial prices
    
    const interval = setInterval(() => {
        console.log("─".repeat(50));
        getPrices();
    }, intervalSeconds * 1000);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n👋 Stopping price monitoring...');
        clearInterval(interval);
        process.exit(0);
    });
}

// Run the script
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--monitor')) {
        const interval = parseInt(args[args.indexOf('--monitor') + 1]) || 30;
        startPriceMonitoring(interval);
    } else {
        getPrices().then(() => {
            console.log("💡 Usage:");
            console.log("  node scripts/alternativePriceFeeds.js           # Get prices once");
            console.log("  node scripts/alternativePriceFeeds.js --monitor # Monitor prices continuously");
            console.log("  node scripts/alternativePriceFeeds.js --monitor 60 # Monitor every 60 seconds");
        });
    }
}
