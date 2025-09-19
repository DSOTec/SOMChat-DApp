import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import { vars } from "hardhat/config";

const PRIVATE_KEY = vars.get("PRIVATE_KEY");
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY", "");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/R05w09aACy83F9wqABQSV",
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      gasPrice: 20000000000, // 20 gwei
    },
    // Alternative RPC endpoints for Sepolia
    sepoliaAlchemy: {
      url: "https://eth-sepolia.g.alchemy.com/v2/demo",
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    sepoliaPublic: {
      url: "https://rpc.sepolia.org",
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  sourcify: {
    enabled: false,
  },
};

export default config;