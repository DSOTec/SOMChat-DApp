import { ethers } from "hardhat";

async function main() {
  console.log("=== Simple Price Feed Console ===\n");
  
  // Working price feeds on Sepolia (based on test results)
  const workingFeeds = {
    "ETH/USD": "0x694AA1769357215DE4FAC081bf1f309aDC325306"
  };
  
  // Alternative: Use our ChatApp contract to get prices
  const chatAppAddress = "0x0f0D658C51FBf731a85f5720fC2fc52992e50da8";
  
  try {
    console.log("📱 Getting prices through ChatApp contract...\n");
    
    const ChatApp = await ethers.getContractFactory("ChatApp");
    const chatApp = ChatApp.attach(chatAppAddress);
    
    // Test ETH/USD (the working one)
    try {
      const ethPrice = await chatApp.getLatestPrice("0x694AA1769357215DE4FAC081bf1f309aDC325306");
      const formattedEthPrice = Number(ethPrice) / 1e8;
      console.log(`💰 ETH/USD: $${formattedEthPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    } catch (error) {
      console.log("❌ ETH/USD failed:", error);
    }
    
    // Check contract status
    console.log("\n📊 Contract Status:");
    const totalGroups = await chatApp.getTotalGroups();
    const interval = await chatApp.interval();
    const defaultGroupId = await chatApp.defaultGroupId();
    
    console.log(`   Total Groups: ${totalGroups.toString()}`);
    console.log(`   Automation Interval: ${interval.toString()} seconds`);
    console.log(`   Default Group ID: ${defaultGroupId.toString()}`);
    
    // If there are groups, try to post prices
    if (Number(totalGroups) > 0) {
      console.log("\n🚀 Testing price posting to group 1...");
      try {
        const tx = await chatApp.postPriceToGroup(1);
        console.log(`   Transaction hash: ${tx.hash}`);
        console.log("   Waiting for confirmation...");
        await tx.wait();
        console.log("✅ Price posted successfully!");
        
        // Get group messages
        const messages = await chatApp.getGroupConversation(1);
        console.log(`   Group now has ${messages.length} messages`);
        
        if (messages.length > 0) {
          console.log("\n📝 Latest messages:");
          const latestMessages = messages.slice(-3);
          latestMessages.forEach((msg: any, index: number) => {
            const isOracle = msg.sender === "0x0000000000000000000000000000000000000000";
            console.log(`   ${index + 1}. ${isOracle ? '🤖 Oracle' : '👤 User'}: ${msg.content}`);
          });
        }
      } catch (error) {
        console.log("❌ Price posting failed:", error);
      }
    } else {
      console.log("\n💡 No groups exist yet. Create a group first to test price feeds!");
    }
    
  } catch (error) {
    console.log("❌ Contract interaction failed:", error);
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("💡 To get price feeds in console:");
  console.log("1. Run: npx hardhat run scripts/simplePriceFeeds.ts --network sepolia");
  console.log("2. Create groups through the web interface");
  console.log("3. Use the 'Post Prices' button in group chats");
  console.log("4. Check this script again to see oracle messages");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
