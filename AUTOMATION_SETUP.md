# Chainlink Automation Setup Guide

## Contract Information
- **ChatApp Address**: `0xf56938dF072E7558a7465304C46BBa2128F45e7F`
- **Network**: Sepolia Testnet
- **Automation Interval**: 300 seconds (5 minutes)

## Setup Steps

### 1. Get Testnet LINK Tokens
Visit: https://faucets.chain.link/sepolia
- Connect your wallet
- Request LINK tokens (you'll need 2-5 LINK for testing)

### 2. Register Upkeep
Visit: https://automation.chain.link/sepolia

**Registration Details:**
- Upkeep Type: Custom logic
- Target Contract: `0xf56938dF072E7558a7465304C46BBa2128F45e7F`
- Upkeep Name: "ChatApp Price Oracle"
- Gas Limit: 500,000
- Starting Balance: 2-5 LINK
- Admin Address: Your wallet address
- Check Data: `0x` (empty bytes)

### 3. Monitor Automation
Once registered and funded, the automation will:
- Check every block if 5 minutes have passed since last execution
- Automatically post BTC/USD, ETH/USD, BTC/ETH, and BNB/ETH prices to group ID 1
- Send oracle messages from address `0x0000000000000000000000000000000000000000`

## Price Feeds Used
- **BTC/USD**: `0x007a22900c13C281aF5a49D9fd2C5d849BaEa0c1`
- **ETH/USD**: `0x694AA1769357215DE4FAC081bf1f309aDC325306`
- **BTC/ETH**: `0x5fb1616F78dA7aFC9FF79e0371741a747D2a7F22`
- **BNB/ETH**: `0x2a3796273d47c4eD363b361D3AEFb7F7E2A13782`

## Testing Manual Price Posting
You can manually trigger price updates using the frontend or by calling:
```solidity
chatApp.postPriceToGroup(groupId)
```

## Frontend Integration
The frontend includes hooks for:
- `useAutomationInterval()` - Check automation settings
- `useLastTimeStamp()` - Monitor last execution
- `useIsOracleMessage()` - Identify oracle messages
- `postPriceToGroup()` - Manual price posting

## Troubleshooting
- Ensure sufficient LINK balance in upkeep
- Check that group ID 1 exists (created automatically)
- Verify price feeds are accessible on Sepolia
- Monitor gas usage and adjust gas limit if needed
