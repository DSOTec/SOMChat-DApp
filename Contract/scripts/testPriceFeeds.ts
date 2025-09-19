import hre from "hardhat";

async function main() {
  const chatAppAddress = "0xf56938dF072E7558a7465304C46BBa2128F45e7F";
  
  // Get the deployed contract
  const chatApp = await hre.ethers.getContractAt("ChatApp", chatAppAddress);
  
  console.log("=== Testing Chainlink Price Feeds ===");
  
  // Sepolia testnet price feed addresses
  const priceFeeds = {
    "BTC/USD": "0x007a22900c13C281aF5a49D9fd2C5d849BaEa0c1",
    "ETH/USD": "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    "BTC/ETH": "0x5fb1616F78dA7aFC9FF79e0371741a747D2a7F22",
    "BNB/ETH": "0x2a3796273d47c4eD363b361D3AEFb7F7E2A13782"
  };
  
  try {
    for (const [name, address] of Object.entries(priceFeeds)) {
      try {
        const price = await chatApp.getLatestPrice(address);
        console.log(`${name}: ${price.toString()}`);
      } catch (error) {
        console.log(`${name}: Error fetching price - ${error}`);
      }
    }
    
    // Test automation status
    console.log("\n=== Automation Status ===");
    const interval = await chatApp.interval();
    const lastTimeStamp = await chatApp.lastTimeStamp();
    const defaultGroupId = await chatApp.defaultGroupId();
    
    console.log(`Automation Interval: ${interval.toString()} seconds`);
    console.log(`Last Timestamp: ${lastTimeStamp.toString()}`);
    console.log(`Default Group ID: ${defaultGroupId.toString()}`);
    
    // Check if upkeep is needed
    const [upkeepNeeded, performData] = await chatApp.checkUpkeep("0x");
    console.log(`Upkeep Needed: ${upkeepNeeded}`);
    console.log(`Perform Data: ${performData}`);
    
  } catch (error) {
    console.error("Error testing contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
