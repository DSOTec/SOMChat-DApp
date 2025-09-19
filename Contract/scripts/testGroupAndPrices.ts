import hre from "hardhat";

async function main() {
  const chatAppAddress = "0xf56938dF072E7558a7465304C46BBa2128F45e7F";
  
  // Get signers
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  const user1 = signers[1] || deployer; // Fallback to deployer if not enough signers
  const user2 = signers[2] || deployer; // Fallback to deployer if not enough signers
  
  // Get the deployed contract
  const chatApp = await hre.ethers.getContractAt("ChatApp", chatAppAddress);
  
  console.log("=== Creating Test Group ===");
  console.log(`Deployer: ${await deployer.getAddress()}`);
  console.log(`User1: ${await user1.getAddress()}`);
  console.log(`User2: ${await user2.getAddress()}`);
  
  try {
    // Create a test group
    const members = [await user1.getAddress(), await user2.getAddress()];
    const tx = await chatApp.connect(deployer).createGroup(
      "Price Feed Test Group",
      "QmTestHash123",
      members
    );
    
    const receipt = await tx.wait();
    console.log(`Group created! Transaction: ${receipt?.hash}`);
    
    // Get group details
    const groupDetails = await chatApp.getGroupDetails(1);
    console.log(`Group Name: ${groupDetails.name}`);
    console.log(`Group Members: ${groupDetails.members.length}`);
    
    console.log("\n=== Testing Manual Price Posting ===");
    
    // Post prices to the group manually
    const priceTx = await chatApp.connect(deployer).postPriceToGroup(1);
    const priceReceipt = await priceTx.wait();
    console.log(`Price posted! Transaction: ${priceReceipt?.hash}`);
    
    // Get group conversation to see oracle messages
    console.log("\n=== Checking Group Messages ===");
    const conversation = await chatApp.getGroupConversation(1);
    console.log(`Total messages in group: ${conversation.length}`);
    
    for (let i = 0; i < conversation.length; i++) {
      const message = conversation[i];
      const isOracle = await chatApp.isOracleMessage(message.sender);
      console.log(`Message ${i + 1}:`);
      console.log(`  Sender: ${message.sender} ${isOracle ? '(ORACLE)' : ''}`);
      console.log(`  Content: ${message.content}`);
      console.log(`  Timestamp: ${message.timestamp}`);
      console.log('');
    }
    
    console.log("=== Automation Check ===");
    const [upkeepNeeded, performData] = await chatApp.checkUpkeep("0x");
    console.log(`Upkeep Needed: ${upkeepNeeded}`);
    
    if (upkeepNeeded) {
      console.log("Automation is ready to run!");
    } else {
      const lastTimeStamp = await chatApp.lastTimeStamp();
      const interval = await chatApp.interval();
      const currentTime = Math.floor(Date.now() / 1000);
      const nextRun = Number(lastTimeStamp) + Number(interval);
      const timeUntilNext = nextRun - currentTime;
      
      console.log(`Current time: ${currentTime}`);
      console.log(`Last run: ${lastTimeStamp}`);
      console.log(`Next run in: ${timeUntilNext} seconds`);
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
