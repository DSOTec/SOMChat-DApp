import { ethers } from "hardhat";

async function main() {
  console.log("=== Chainlink Price Feeds on Sepolia ===\n");
  
  // Chainlink Price Feed addresses on Sepolia testnet
  const priceFeeds = {
    "BTC/USD": "0x007a22900c13C281aF5a49D9fd2C5d849BaEa0c1",
    "ETH/USD": "0x694AA1769357215DE4FAC081bf1f309aDC325306", 
    "BTC/ETH": "0xCfe54B5c468301f0C6AE4a63F9b6C1d28932D7dc",
    "BNB/ETH": "0x9Ae3a6b1E5F0c5C60b675ECa8d7edD0Eed417F07"
  };

  // AggregatorV3Interface ABI
  const aggregatorV3InterfaceABI = [
    {
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "description",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
      name: "getRoundData",
      outputs: [
        { internalType: "uint80", name: "roundId", type: "uint80" },
        { internalType: "int256", name: "answer", type: "int256" },
        { internalType: "uint256", name: "startedAt", type: "uint256" },
        { internalType: "uint256", name: "updatedAt", type: "uint256" },
        { internalType: "uint80", name: "answeredInRound", type: "uint80" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "latestRoundData",
      outputs: [
        { internalType: "uint80", name: "roundId", type: "uint80" },
        { internalType: "int256", name: "answer", type: "int256" },
        { internalType: "uint256", name: "startedAt", type: "uint256" },
        { internalType: "uint256", name: "updatedAt", type: "uint256" },
        { internalType: "uint80", name: "answeredInRound", type: "uint80" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "version",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  for (const [pairName, feedAddress] of Object.entries(priceFeeds)) {
    try {
      console.log(`📊 ${pairName} Price Feed:`);
      console.log(`   Address: ${feedAddress}`);
      
      // Create contract instance
      const priceFeed = new ethers.Contract(feedAddress, aggregatorV3InterfaceABI, ethers.provider);
      
      // Get latest round data
      const roundData = await priceFeed.latestRoundData();
      
      // Get decimals for proper formatting
      const decimals = await priceFeed.decimals();
      
      // Format price
      const price = Number(roundData.answer) / Math.pow(10, decimals);
      
      // Get description
      const description = await priceFeed.description();
      
      console.log(`   Description: ${description}`);
      console.log(`   Price: $${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`);
      console.log(`   Decimals: ${decimals}`);
      console.log(`   Round ID: ${roundData.roundId.toString()}`);
      console.log(`   Updated At: ${new Date(Number(roundData.updatedAt) * 1000).toISOString()}`);
      console.log(`   Raw Answer: ${roundData.answer.toString()}`);
      console.log("");
      
    } catch (error) {
      console.log(`❌ Error fetching ${pairName}:`, error);
      console.log("");
    }
  }
  
  // Test our ChatApp contract's price feed function
  console.log("=== Testing ChatApp Contract Price Feeds ===\n");
  
  const chatAppAddress = "0x0f0D658C51FBf731a85f5720fC2fc52992e50da8";
  
  try {
    const ChatApp = await ethers.getContractFactory("ChatApp");
    const chatApp = ChatApp.attach(chatAppAddress);
    
    console.log("📱 ChatApp Contract Price Tests:");
    
    for (const [pairName, feedAddress] of Object.entries(priceFeeds)) {
      try {
        const price = await chatApp.getLatestPrice(feedAddress);
        const formattedPrice = Number(price) / 1e8; // Chainlink feeds typically use 8 decimals
        console.log(`   ${pairName}: $${formattedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`);
      } catch (error) {
        console.log(`   ${pairName}: Error - ${error}`);
      }
    }
    
  } catch (error) {
    console.log("❌ Error testing ChatApp contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
