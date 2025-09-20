import { ethers } from "hardhat";

async function main() {
  const chatAppAddress = "0x0f0D658C51FBf731a85f5720fC2fc52992e50da8";
  
  // Get the contract instance
  const ChatApp = await ethers.getContractFactory("ChatApp");
  const chatApp = ChatApp.attach(chatAppAddress);
  
  console.log("=== Creating Test Group ===");
  
  try {
    // Get the signer (deployer account)
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    
    // Create a test group
    const groupName = "Test Group";
    const avatarHash = ""; // Empty avatar hash
    const members = [deployer.address]; // Add deployer as member
    
    console.log("Creating group with:", {
      name: groupName,
      avatarHash: avatarHash,
      members: members
    });
    
    const tx = await chatApp.createGroup(groupName, avatarHash, members);
    console.log("Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Group created successfully!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Get the group ID from events
    const groupCreatedEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = chatApp.interface.parseLog(log);
        return parsed?.name === 'GroupCreated';
      } catch {
        return false;
      }
    });
    
    if (groupCreatedEvent) {
      const parsed = chatApp.interface.parseLog(groupCreatedEvent);
      const groupId = parsed?.args.groupId;
      console.log("Created Group ID:", groupId.toString());
      
      // Test getting group details
      const groupDetails = await chatApp.getGroupDetails(groupId);
      console.log("Group Details:", {
        name: groupDetails[0],
        avatarHash: groupDetails[1],
        memberCount: groupDetails[2].length,
        members: groupDetails[2]
      });
      
      // Test posting price to the group
      console.log("\n=== Testing Price Posting ===");
      try {
        const priceTx = await chatApp.postPriceToGroup(groupId);
        console.log("Price posting transaction:", priceTx.hash);
        await priceTx.wait();
        console.log("Price posted successfully!");
        
        // Check messages
        const messages = await chatApp.getGroupConversation(groupId);
        console.log("Messages in group:", messages.length);
        
        messages.forEach((msg: any, index: number) => {
          console.log(`Message ${index + 1}:`, {
            sender: msg.sender,
            content: msg.content,
            isOracle: msg.sender === "0x0000000000000000000000000000000000000000",
            timestamp: new Date(Number(msg.timestamp) * 1000).toISOString()
          });
        });
        
      } catch (priceError) {
        console.log("Price posting failed:", priceError);
      }
    }
    
    // Check total groups
    const totalGroups = await chatApp.getTotalGroups();
    console.log("Total Groups:", totalGroups.toString());
    
  } catch (error) {
    console.error("Group creation failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
