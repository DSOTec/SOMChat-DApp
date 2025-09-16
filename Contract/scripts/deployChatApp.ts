import { ethers, run } from "hardhat";
import hre from "hardhat";

async function main(): Promise<string> {
  console.log("Deploying ChatApp contract...");

  // Get the provider (Ethers v6 way)
  const [signer] = await hre.ethers.getSigners();
  const provider = signer.provider;

  // Get the contract factory
  const ChatApp = await ethers.getContractFactory("ChatApp");

  // Deploy the contract
  const chatApp = await ChatApp.deploy();

  // Wait for deployment to complete
  await chatApp.waitForDeployment();

  // Get the deployed contract address
  const contractAddress = await chatApp.getAddress();

  console.log("ChatApp deployed to:", contractAddress);
  console.log("Transaction hash:", chatApp.deploymentTransaction().hash);

  // Verify deployment by checking if contract exists
  const code = await provider.getCode(contractAddress);
  if (code === "0x") {
    console.error("Contract deployment failed - no code at address");
    return contractAddress;
  } else {
    console.log("Contract deployment successful!");
    console.log("Contract code size:", code.length, "bytes");
  }

  // Auto-verify contract on Etherscan (only for testnets/mainnet)
  const network = await provider.getNetwork();
  if (network.chainId !== 31337n) { // Skip verification for local hardhat network
    console.log("\nVerifying contract on Etherscan...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [], // ChatApp has no constructor arguments
      });
      console.log("Contract verified successfully!");
    } catch (error: any) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log("Contract is already verified!");
      } else {
        console.error("Verification failed:", error.message);
        console.log("You can verify manually later with:");
        console.log(`npx hardhat verify --network ${process.env.HARDHAT_NETWORK || "sepolia"} ${contractAddress}`);
      }
    }
  }

  return contractAddress;
}

// Execute deployment
main()
  .then((address) => {
    console.log("\n=== Deployment Summary ===");
    console.log("Contract: ChatApp");
    console.log("Address:", address);
    console.log("Network:", process.env.HARDHAT_NETWORK || "localhost");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
