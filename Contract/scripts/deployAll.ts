import { ethers, run } from "hardhat";

interface DeploymentResult {
  contractName: string;
  address: string;
  verified: boolean;
}

async function deployContract(contractName: string, constructorArgs: any[] = []): Promise<DeploymentResult> {
  console.log(`\nDeploying ${contractName} contract...`);

  // Get the contract factory
  const ContractFactory = await ethers.getContractFactory(contractName);

  // Deploy the contract
  const contract = await ContractFactory.deploy(...constructorArgs);

  // Wait for deployment to complete
  await contract.waitForDeployment();

  // Get the deployed contract address
  const contractAddress = contract.target as string;

  console.log(`${contractName} deployed to:`, contractAddress);
  console.log("Transaction hash:", contract.deploymentTransaction()?.hash);

  // Verify deployment by checking if contract exists
  const code = await ethers.provider.getCode(contractAddress);
  if (code === "0x") {
    console.error(`${contractName} deployment failed - no code at address`);
    return { contractName, address: contractAddress, verified: false };
  } else {
    console.log(`${contractName} deployment successful!`);
    console.log("Contract code size:", code.length, "bytes");
  }

  // Auto-verify contract on Etherscan (only for testnets/mainnet)
  const network = await ethers.provider.getNetwork();
  let verified = false;
  
  if (network.chainId !== 31337n) { // Skip verification for local hardhat network
    console.log(`\nVerifying ${contractName} on Etherscan...`);
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: constructorArgs,
      });
      console.log(`${contractName} verified successfully!`);
      verified = true;
    } catch (error: any) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log(`${contractName} is already verified!`);
        verified = true;
      } else {
        console.error(`${contractName} verification failed:`, error.message);
        console.log("You can verify manually later with:");
        console.log(`npx hardhat verify --network ${process.env.HARDHAT_NETWORK || "sepolia"} ${contractAddress}`);
        verified = false;
      }
    }
  } else {
    console.log("Skipping verification on local network");
    verified = true; // Consider it "verified" for local networks
  }

  return { contractName, address: contractAddress, verified };
}

async function main(): Promise<DeploymentResult[]> {
  console.log("=== Starting Full Contract Deployment ===");
  
  const deployments: DeploymentResult[] = [];

  try {
    // Deploy UserRegistry first (no dependencies)
    const userRegistry = await deployContract("UserRegistry");
    deployments.push(userRegistry);

    // Deploy ChatApp (no dependencies on UserRegistry in constructor)
    const chatApp = await deployContract("ChatApp");
    deployments.push(chatApp);

    return deployments;
  } catch (error) {
    console.error("Deployment process failed:", error);
    throw error;
  }
}

// Execute deployment
main()
  .then((deployments) => {
    console.log("\n=== Deployment Summary ===");
    deployments.forEach((deployment) => {
      console.log(`\n${deployment.contractName}:`);
      console.log(`  Address: ${deployment.address}`);
      console.log(`  Verified: ${deployment.verified ? '✅' : '❌'}`);
    });
    
    console.log(`\nNetwork: ${process.env.HARDHAT_NETWORK || "localhost"}`);
    console.log("\n=== Contract Addresses for Frontend ===");
    deployments.forEach((deployment) => {
      console.log(`${deployment.contractName.toUpperCase()}_ADDRESS=${deployment.address}`);
    });
    
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
