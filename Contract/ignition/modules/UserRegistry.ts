import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("UserRegistryModule", (m) => {
  // Deploy the UserRegistry contract
  const userRegistry = m.contract("UserRegistry");

  return { userRegistry };
});
