import { ethers } from "hardhat";

async function main() {
  const chatAppAddress = "0x0f0D658C51FBf731a85f5720fC2fc52992e50da8";
  
  // Get the contract instance
  const ChatApp = await ethers.getContractFactory("ChatApp");
  const chatApp = ChatApp.attach(chatAppAddress);
  
  console.log("=== Testing ChatApp Contract ===");
  console.log("Contract Address:", chatAppAddress);
  
  try {
    // Test 1: Check total groups
    const totalGroups = await chatApp.getTotalGroups();
    console.log("Total Groups:", totalGroups.toString());
    
    // Test 2: Check automation settings
    const interval = await chatApp.interval();
    const lastTimeStamp = await chatApp.lastTimeStamp();
    const defaultGroupId = await chatApp.defaultGroupId();
    
    console.log("Automation Interval:", interval.toString(), "seconds");
    console.log("Last Timestamp:", lastTimeStamp.toString());
    console.log("Default Group ID:", defaultGroupId.toString());
    
    // Test 3: Check if we can read price feeds
    console.log("\n=== Testing Price Feeds ===");
    try {
      // BTC/USD feed address on Sepolia
      const btcUsdFeed = "0x007a22900c13C281aF5a49D9fd2C5d849BaEa0c1";
      const btcPrice = await chatApp.getLatestPrice(btcUsdFeed);
      console.log("BTC/USD Price:", (Number(btcPrice) / 1e8).toFixed(2));
    } catch (error) {
      console.log("Price feed test failed:", error);
    }
    
    // Test 4: If there are groups, try to get group details
    if (Number(totalGroups) > 0) {
      console.log("\n=== Testing Group Details ===");
      for (let i = 1; i <= Number(totalGroups); i++) {
        try {
          const groupDetails = await chatApp.getGroupDetails(i);
          console.log(`Group ${i}:`, {
            name: groupDetails[0],
            avatarHash: groupDetails[1],
            memberCount: groupDetails[2].length
          });
          
          // Try to get group messages
          const messages = await chatApp.getGroupConversation(i);
          console.log(`Group ${i} Messages:`, messages.length);
        } catch (error) {
          console.log(`Error getting group ${i} details:`, error);
        }
      }
    }
    
    // Test 5: Test manual price posting (if there are groups)
    if (Number(totalGroups) > 0) {
      console.log("\n=== Testing Manual Price Posting ===");
      try {
        const tx = await chatApp.postPriceToGroup(1);
        console.log("Price posting transaction:", tx.hash);
        await tx.wait();
        console.log("Price posted successfully!");
        
        // Check messages after posting
        const messages = await chatApp.getGroupConversation(1);
        console.log("Messages after price posting:", messages.length);
        
        // Show the latest messages
        if (messages.length > 0) {
          const latestMessages = messages.slice(-4); // Get last 4 messages
          latestMessages.forEach((msg: any, index: number) => {
            console.log(`Message ${index + 1}:`, {
              sender: msg.sender,
              content: msg.content,
              isOracle: msg.sender === "0x0000000000000000000000000000000000000000"
            });
          });
        }
      } catch (error) {
        console.log("Manual price posting failed:", error);
      }
    }
    
  } catch (error) {
    console.error("Contract test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
