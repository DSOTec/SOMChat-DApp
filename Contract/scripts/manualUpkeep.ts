import { ethers } from "hardhat";

async function main() {
  console.log("=== Manual Upkeep Test ===\n");
  
  const chatAppAddress = "0x0f0D658C51FBf731a85f5720fC2fc52992e50da8";
  
  try {
    const ChatApp = await ethers.getContractFactory("ChatApp");
    const chatApp = ChatApp.attach(chatAppAddress);
    
    console.log("🔍 Checking upkeep status...");
    const [upkeepNeeded, performData] = await chatApp.checkUpkeep("0x");
    console.log(`Upkeep needed: ${upkeepNeeded}`);
    
    if (upkeepNeeded) {
      console.log("\n🚀 Performing manual upkeep...");
      const tx = await chatApp.performUpkeep(performData);
      console.log(`Transaction hash: ${tx.hash}`);
      console.log("Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("✅ Manual upkeep completed!");
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);
      
      // Check for oracle messages
      console.log("\n📝 Checking for new oracle messages...");
      const messages = await chatApp.getGroupConversation(1);
      console.log(`Total messages in group 1: ${messages.length}`);
      
      // Show recent messages
      const recentMessages = messages.slice(-5);
      console.log("\nRecent messages:");
      recentMessages.forEach((msg: any, index: number) => {
        const isOracle = msg.sender.toLowerCase() === "0x0000000000000000000000000000000000000000";
        const time = new Date(Number(msg.timestamp) * 1000).toLocaleTimeString();
        console.log(`  ${time} ${isOracle ? '🤖 Oracle' : '👤 User'}: ${msg.content}`);
      });
      
    } else {
      console.log("❌ Upkeep not needed at this time");
    }
    
  } catch (error) {
    console.log("❌ Manual upkeep failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
