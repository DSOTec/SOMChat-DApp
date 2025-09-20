import { ethers } from "hardhat";

async function main() {
  console.log("=== Chainlink Automation Status Check ===\n");
  
  const chatAppAddress = "0x0f0D658C51FBf731a85f5720fC2fc52992e50da8";
  
  try {
    const ChatApp = await ethers.getContractFactory("ChatApp");
    const chatApp = ChatApp.attach(chatAppAddress);
    
    console.log("📊 Contract Automation Settings:");
    
    // Get automation configuration
    const interval = await chatApp.interval();
    const lastTimeStamp = await chatApp.lastTimeStamp();
    const defaultGroupId = await chatApp.defaultGroupId();
    const totalGroups = await chatApp.getTotalGroups();
    
    console.log(`   Automation Interval: ${interval.toString()} seconds (${Number(interval)/60} minutes)`);
    console.log(`   Last Execution: ${new Date(Number(lastTimeStamp) * 1000).toISOString()}`);
    console.log(`   Default Group ID: ${defaultGroupId.toString()}`);
    console.log(`   Total Groups: ${totalGroups.toString()}`);
    
    // Calculate time since last execution
    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastExecution = currentTime - Number(lastTimeStamp);
    const nextExecutionIn = Number(interval) - timeSinceLastExecution;
    
    console.log(`   Time since last execution: ${timeSinceLastExecution} seconds`);
    console.log(`   Next execution in: ${nextExecutionIn > 0 ? nextExecutionIn : 0} seconds`);
    
    // Check if upkeep is needed
    console.log("\n🔍 Checking if upkeep is needed...");
    let upkeepNeeded = false;
    try {
      const [needsUpkeep, performData] = await chatApp.checkUpkeep("0x");
      upkeepNeeded = needsUpkeep;
      console.log(`   Upkeep needed: ${upkeepNeeded}`);
      console.log(`   Perform data: ${performData}`);
      
      if (upkeepNeeded) {
        console.log("✅ Automation should trigger soon!");
      } else {
        if (Number(totalGroups) === 0) {
          console.log("⚠️  No groups exist - automation won't trigger");
        } else if (nextExecutionIn > 0) {
          console.log(`⏰ Waiting for next interval (${nextExecutionIn} seconds)`);
        } else {
          console.log("❓ Upkeep not needed for unknown reason");
        }
      }
    } catch (error) {
      console.log("❌ Failed to check upkeep:", error.message);
    }
    
    // If groups exist, check for oracle messages
    if (Number(totalGroups) > 0) {
      console.log("\n📝 Checking for oracle messages in groups:");
      
      for (let i = 1; i <= Number(totalGroups); i++) {
        try {
          const messages = await chatApp.getGroupConversation(i);
          const groupDetails = await chatApp.getGroupDetails(i);
          
          console.log(`\n   Group ${i}: "${groupDetails.name}"`);
          console.log(`   Total messages: ${messages.length}`);
          
          // Count oracle messages
          let oracleMessageCount = 0;
          let latestOracleTime = 0;
          
          for (const msg of messages) {
            const isOracle = msg.sender.toLowerCase() === "0x0000000000000000000000000000000000000000";
            if (isOracle) {
              oracleMessageCount++;
              if (Number(msg.timestamp) > latestOracleTime) {
                latestOracleTime = Number(msg.timestamp);
              }
            }
          }
          
          console.log(`   Oracle messages: ${oracleMessageCount}`);
          if (oracleMessageCount > 0) {
            console.log(`   Latest oracle message: ${new Date(latestOracleTime * 1000).toISOString()}`);
            
            // Show recent oracle messages
            const recentMessages = messages.slice(-5);
            console.log("   Recent messages:");
            recentMessages.forEach((msg: any, index: number) => {
              const isOracle = msg.sender.toLowerCase() === "0x0000000000000000000000000000000000000000";
              const time = new Date(Number(msg.timestamp) * 1000).toLocaleTimeString();
              console.log(`     ${time} ${isOracle ? '🤖' : '👤'}: ${msg.content}`);
            });
          } else {
            console.log("   No oracle messages found yet");
          }
          
        } catch (error) {
          console.log(`   ❌ Failed to check group ${i}:`, error.message);
        }
      }
    } else {
      console.log("\n💡 Create a group first to enable automation!");
      console.log("   1. Go to http://localhost:3000");
      console.log("   2. Connect your wallet");
      console.log("   3. Create a new group");
      console.log("   4. Wait for automation to trigger");
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("🔄 Automation Status Summary:");
    
    if (Number(totalGroups) === 0) {
      console.log("❌ Automation inactive - no groups exist");
    } else if (upkeepNeeded) {
      console.log("🟡 Automation ready to trigger");
    } else if (nextExecutionIn > 0) {
      console.log(`🟢 Automation active - next execution in ${Math.ceil(nextExecutionIn/60)} minutes`);
    } else {
      console.log("🔍 Automation status unclear - check manually");
    }
    
  } catch (error) {
    console.log("❌ Failed to check automation status:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
