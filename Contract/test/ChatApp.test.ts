import { expect } from "chai";
import hre from "hardhat";
import { ChatApp } from "../typechain-types";
import { Signer } from "ethers";

describe("ChatApp", function () {
  let chatApp: ChatApp;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  let user3: Signer;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, user3] = await hre.ethers.getSigners();

    // Deploy ChatApp contract
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    chatApp = await ChatApp.deploy();
    await chatApp.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await chatApp.getAddress()).to.be.properAddress;
    });

    it("Should have zero groups initially", async function () {
      expect(await chatApp.groupCounter()).to.equal(0);
      expect(await chatApp.getTotalGroups()).to.equal(0);
    });
  });

  describe("Direct Messaging", function () {
    const messageContent = "Hello, this is a test message!";

    it("Should send a message between two users", async function () {
      await expect(chatApp.connect(user1).sendMessage(user2.address, messageContent))
        .to.emit(chatApp, "MessageSent")
        .withArgs(user1.address, user2.address, messageContent, await hre.ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
    });

    it("Should store message correctly in conversation", async function () {
      await chatApp.connect(user1).sendMessage(user2.address, messageContent);

      const conversation = await chatApp.getConversation(user1.address, user2.address);
      expect(conversation.length).to.equal(1);
      expect(conversation[0].sender).to.equal(user1.address);
      expect(conversation[0].receiver).to.equal(user2.address);
      expect(conversation[0].content).to.equal(messageContent);
      expect(conversation[0].timestamp).to.be.greaterThan(0);
    });

    it("Should return same conversation regardless of parameter order", async function () {
      await chatApp.connect(user1).sendMessage(user2.address, "Message 1");
      await chatApp.connect(user2).sendMessage(user1.address, "Message 2");

      const conversation1 = await chatApp.getConversation(user1.address, user2.address);
      const conversation2 = await chatApp.getConversation(user2.address, user1.address);

      expect(conversation1.length).to.equal(2);
      expect(conversation2.length).to.equal(2);
      expect(conversation1[0].content).to.equal(conversation2[0].content);
      expect(conversation1[1].content).to.equal(conversation2[1].content);
    });

    it("Should not allow sending message to zero address", async function () {
      await expect(
        chatApp.connect(user1).sendMessage(hre.ethers.ZeroAddress, messageContent)
      ).to.be.revertedWith("Invalid receiver address");
    });

    it("Should not allow empty message content", async function () {
      await expect(
        chatApp.connect(user1).sendMessage(user2.address, "")
      ).to.be.revertedWith("Message content cannot be empty");
    });

    it("Should not allow sending message to yourself", async function () {
      await expect(
        chatApp.connect(user1).sendMessage(user1.address, messageContent)
      ).to.be.revertedWith("Cannot send message to yourself");
    });

    it("Should handle multiple messages in conversation", async function () {
      await chatApp.connect(user1).sendMessage(user2.address, "First message");
      await chatApp.connect(user2).sendMessage(user1.address, "Second message");
      await chatApp.connect(user1).sendMessage(user2.address, "Third message");

      const conversation = await chatApp.getConversation(user1.address, user2.address);
      expect(conversation.length).to.equal(3);
      expect(conversation[0].content).to.equal("First message");
      expect(conversation[1].content).to.equal("Second message");
      expect(conversation[2].content).to.equal("Third message");
    });
  });

  describe("Group Functionality", function () {
    const groupName = "Test Group";
    const avatarHash = "QmTestHash123";

    it("Should create a group successfully", async function () {
      const members = [user2.address, user3.address];

      await expect(chatApp.connect(user1).createGroup(groupName, avatarHash, members))
        .to.emit(chatApp, "GroupCreated")
        .withArgs(1, groupName, user1.address);

      expect(await chatApp.groupCounter()).to.equal(1);
      expect(await chatApp.getTotalGroups()).to.equal(1);
    });

    it("Should store group details correctly", async function () {
      const members = [user2.address, user3.address];
      await chatApp.connect(user1).createGroup(groupName, avatarHash, members);

      const groupDetails = await chatApp.getGroupDetails(1);
      expect(groupDetails.name).to.equal(groupName);
      expect(groupDetails.avatarHash).to.equal(avatarHash);
      expect(groupDetails.members.length).to.equal(3); // Creator + 2 members
      expect(groupDetails.members).to.include(user1.address); // Creator should be included
      expect(groupDetails.members).to.include(user2.address);
      expect(groupDetails.members).to.include(user3.address);
    });

    it("Should include creator in members if not already present", async function () {
      const members = [user2.address, user3.address];
      await chatApp.connect(user1).createGroup(groupName, avatarHash, members);

      expect(await chatApp.isGroupMember(1, user1.address)).to.be.true;
      expect(await chatApp.isGroupMember(1, user2.address)).to.be.true;
      expect(await chatApp.isGroupMember(1, user3.address)).to.be.true;
    });

    it("Should not duplicate creator if already in members", async function () {
      const members = [user1.address, user2.address, user3.address];
      await chatApp.connect(user1).createGroup(groupName, avatarHash, members);

      const groupDetails = await chatApp.getGroupDetails(1);
      expect(groupDetails.members.length).to.equal(3); // Should not duplicate creator
    });

    it("Should not allow empty group name", async function () {
      const members = [user2.address];
      await expect(
        chatApp.connect(user1).createGroup("", avatarHash, members)
      ).to.be.revertedWith("Group name cannot be empty");
    });

    it("Should not allow group with no members", async function () {
      await expect(
        chatApp.connect(user1).createGroup(groupName, avatarHash, [])
      ).to.be.revertedWith("Group must have at least one member");
    });

    it("Should not allow invalid member addresses", async function () {
      const members = [hre.ethers.ZeroAddress];
      await expect(
        chatApp.connect(user1).createGroup(groupName, avatarHash, members)
      ).to.be.revertedWith("Invalid member address");
    });
  });

  describe("Group Messaging", function () {
    let groupId: number;
    const groupMessage = "Hello group!";

    beforeEach(async function () {
      const members = [user2.address, user3.address];
      await chatApp.connect(user1).createGroup("Test Group", "hash", members);
      groupId = 1;
    });

    it("Should send group message successfully", async function () {
      await expect(chatApp.connect(user1).sendGroupMessage(groupId, groupMessage))
        .to.emit(chatApp, "GroupMessageSent")
        .withArgs(groupId, user1.address, groupMessage, await hre.ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
    });

    it("Should store group message correctly", async function () {
      await chatApp.connect(user1).sendGroupMessage(groupId, groupMessage);

      const conversation = await chatApp.connect(user1).getGroupConversation(groupId);
      expect(conversation.length).to.equal(1);
      expect(conversation[0].sender).to.equal(user1.address);
      expect(conversation[0].receiver).to.equal(hre.ethers.ZeroAddress); // No specific receiver for group messages
      expect(conversation[0].content).to.equal(groupMessage);
      expect(conversation[0].timestamp).to.be.greaterThan(0);
    });

    it("Should allow all group members to send messages", async function () {
      await chatApp.connect(user1).sendGroupMessage(groupId, "Message from user1");
      await chatApp.connect(user2).sendGroupMessage(groupId, "Message from user2");
      await chatApp.connect(user3).sendGroupMessage(groupId, "Message from user3");

      const conversation = await chatApp.connect(user1).getGroupConversation(groupId);
      expect(conversation.length).to.equal(3);
      expect(conversation[0].sender).to.equal(user1.address);
      expect(conversation[1].sender).to.equal(user2.address);
      expect(conversation[2].sender).to.equal(user3.address);
    });

    it("Should not allow non-members to send group messages", async function () {
      const [, , , , nonMember] = await hre.ethers.getSigners();
      
      await expect(
        chatApp.connect(nonMember).sendGroupMessage(groupId, groupMessage)
      ).to.be.revertedWith("Not a member of this group");
    });

    it("Should not allow sending to invalid group ID", async function () {
      await expect(
        chatApp.connect(user1).sendGroupMessage(999, groupMessage)
      ).to.be.revertedWith("Invalid group ID");
    });

    it("Should not allow empty group message content", async function () {
      await expect(
        chatApp.connect(user1).sendGroupMessage(groupId, "")
      ).to.be.revertedWith("Message content cannot be empty");
    });

    it("Should not allow non-members to view group conversation", async function () {
      const [, , , , nonMember] = await hre.ethers.getSigners();
      
      await expect(
        chatApp.connect(nonMember).getGroupConversation(groupId)
      ).to.be.revertedWith("Not a member of this group");
    });
  });

  describe("Utility Functions", function () {
    it("Should generate consistent conversation IDs", async function () {
      const id1 = await chatApp.getConversationId(user1.address, user2.address);
      const id2 = await chatApp.getConversationId(user2.address, user1.address);
      
      expect(id1).to.equal(id2);
    });

    it("Should correctly identify group membership", async function () {
      const members = [user2.address, user3.address];
      await chatApp.connect(user1).createGroup("Test Group", "hash", members);

      expect(await chatApp.isGroupMember(1, user1.address)).to.be.true;
      expect(await chatApp.isGroupMember(1, user2.address)).to.be.true;
      expect(await chatApp.isGroupMember(1, user3.address)).to.be.true;
      expect(await chatApp.isGroupMember(1, owner.address)).to.be.false;
    });

    it("Should return false for invalid group ID in membership check", async function () {
      expect(await chatApp.isGroupMember(999, user1.address)).to.be.false;
      expect(await chatApp.isGroupMember(0, user1.address)).to.be.false;
    });
  });
});
