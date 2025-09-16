import { expect } from "chai";
import { ethers } from "hardhat";
import { UserRegistry } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("UserRegistry", function () {
  let userRegistry: UserRegistry;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy UserRegistry contract
    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    userRegistry = await UserRegistry.deploy();
    await userRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await userRegistry.getAddress()).to.be.properAddress;
    });

    it("Should have zero users initially", async function () {
      expect(await userRegistry.getUserCount()).to.equal(0);
      const allUsers = await userRegistry.getAllUsers();
      expect(allUsers.length).to.equal(0);
    });
  });

  describe("User Registration", function () {
    const ensName = "alice.eth";
    const avatarHash = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";

    it("Should register a user successfully", async function () {
      await expect(userRegistry.connect(user1).registerUser(ensName, avatarHash))
        .to.emit(userRegistry, "UserRegistered")
        .withArgs(user1.address, ensName, avatarHash);

      // Check user details are stored correctly
      const userDetails = await userRegistry.getUserDetails(user1.address);
      expect(userDetails.ensName).to.equal(ensName);
      expect(userDetails.avatarHash).to.equal(avatarHash);
      expect(userDetails.registered).to.be.true;

      // Check user is in allUsers array
      const allUsers = await userRegistry.getAllUsers();
      expect(allUsers.length).to.equal(1);
      expect(allUsers[0]).to.equal(user1.address);

      // Check user count
      expect(await userRegistry.getUserCount()).to.equal(1);

      // Check isUserRegistered
      expect(await userRegistry.isUserRegistered(user1.address)).to.be.true;
    });

    it("Should store user details correctly via public mapping", async function () {
      await userRegistry.connect(user1).registerUser(ensName, avatarHash);

      const user = await userRegistry.users(user1.address);
      expect(user.ensName).to.equal(ensName);
      expect(user.avatarHash).to.equal(avatarHash);
      expect(user.registered).to.be.true;
    });

    it("Should not allow duplicate registration", async function () {
      // Register user first time
      await userRegistry.connect(user1).registerUser(ensName, avatarHash);

      // Try to register same user again
      await expect(
        userRegistry.connect(user1).registerUser("newname.eth", "newHash")
      ).to.be.revertedWith("User is already registered");
    });

    it("Should not allow empty ENS name", async function () {
      await expect(
        userRegistry.connect(user1).registerUser("", avatarHash)
      ).to.be.revertedWith("ENS name cannot be empty");
    });

    it("Should allow multiple different users to register", async function () {
      const ensName2 = "bob.eth";
      const avatarHash2 = "QmXwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH";

      // Register first user
      await userRegistry.connect(user1).registerUser(ensName, avatarHash);

      // Register second user
      await userRegistry.connect(user2).registerUser(ensName2, avatarHash2);

      // Check both users are registered
      expect(await userRegistry.isUserRegistered(user1.address)).to.be.true;
      expect(await userRegistry.isUserRegistered(user2.address)).to.be.true;

      // Check getAllUsers returns both addresses
      const allUsers = await userRegistry.getAllUsers();
      expect(allUsers.length).to.equal(2);
      expect(allUsers).to.include(user1.address);
      expect(allUsers).to.include(user2.address);

      // Check user count
      expect(await userRegistry.getUserCount()).to.equal(2);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      // Register some users for testing
      await userRegistry.connect(user1).registerUser("alice.eth", "hash1");
      await userRegistry.connect(user2).registerUser("bob.eth", "hash2");
    });

    it("Should return all registered users", async function () {
      const allUsers = await userRegistry.getAllUsers();
      expect(allUsers.length).to.equal(2);
      expect(allUsers).to.include(user1.address);
      expect(allUsers).to.include(user2.address);
    });

    it("Should return correct user count", async function () {
      expect(await userRegistry.getUserCount()).to.equal(2);
    });

    it("Should return correct registration status", async function () {
      expect(await userRegistry.isUserRegistered(user1.address)).to.be.true;
      expect(await userRegistry.isUserRegistered(user2.address)).to.be.true;
      expect(await userRegistry.isUserRegistered(owner.address)).to.be.false;
    });

    it("Should return correct user details", async function () {
      const user1Details = await userRegistry.getUserDetails(user1.address);
      expect(user1Details.ensName).to.equal("alice.eth");
      expect(user1Details.avatarHash).to.equal("hash1");
      expect(user1Details.registered).to.be.true;

      const user2Details = await userRegistry.getUserDetails(user2.address);
      expect(user2Details.ensName).to.equal("bob.eth");
      expect(user2Details.avatarHash).to.equal("hash2");
      expect(user2Details.registered).to.be.true;
    });

    it("Should return empty details for unregistered user", async function () {
      const unregisteredDetails = await userRegistry.getUserDetails(owner.address);
      expect(unregisteredDetails.ensName).to.equal("");
      expect(unregisteredDetails.avatarHash).to.equal("");
      expect(unregisteredDetails.registered).to.be.false;
    });
  });
});
