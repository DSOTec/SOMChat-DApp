import { ethers } from "hardhat";

async function main(): Promise<string> {
  console.log("Deploying UserRegistry contract...");

  // Get the contract factory
  const UserRegistry = await ethers.getContractFactory("UserRegistry");

  // Deploy the contract
  const userRegistry = await UserRegistry.deploy();

  // Wait for deployment to complete
  await userRegistry.waitForDeployment();

  // Get the deployed contract address
  const contractAddress = await userRegistry.getAddress();

  console.log("UserRegistry deployed to:", contractAddress);
  console.log("Transaction hash:", userRegistry.deploymentTransaction().hash);

  // Verify deployment by checking if contract exists
  const code = await ethers.provider.getCode(contractAddress);
  if (code === "0x") {
    console.error("Contract deployment failed - no code at address");
  } else {
    console.log("Contract deployment successful!");
    console.log("Contract code size:", code.length, "bytes");
  }

  return contractAddress;
}

// Execute deployment
main()
  .then((address) => {
    console.log("\n=== Deployment Summary ===");
    console.log("Contract: UserRegistry");
    console.log("Address:", address);
    console.log("Network:", process.env.HARDHAT_NETWORK || "localhost");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
