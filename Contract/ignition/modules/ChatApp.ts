import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ChatAppModule", (m) => {
  // Deploy the ChatApp contract
  const chatApp = m.contract("ChatApp");

  return { chatApp };
});
