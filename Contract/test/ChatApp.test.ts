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

    // Deploy ChatApp contract with automation interval (300 seconds = 5 minutes)
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    chatApp = await ChatApp.deploy(300);
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
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      
      await expect(chatApp.connect(user1).sendMessage(user2Address, messageContent))
        .to.emit(chatApp, "MessageSent")
        .withArgs(user1Address, user2Address, messageContent, await hre.ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
    });

    it("Should store message correctly in conversation", async function () {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      
      await chatApp.connect(user1).sendMessage(user2Address, messageContent);

      const conversation = await chatApp.getConversation(user1Address, user2Address);
      expect(conversation.length).to.equal(1);
      expect(conversation[0].sender).to.equal(user1Address);
      expect(conversation[0].receiver).to.equal(user2Address);
      expect(conversation[0].content).to.equal(messageContent);
      expect(conversation[0].timestamp).to.be.greaterThan(0);
    });

    it("Should return same conversation regardless of parameter order", async function () {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      
      await chatApp.connect(user1).sendMessage(user2Address, "Message 1");
      await chatApp.connect(user2).sendMessage(user1Address, "Message 2");

      const conversation1 = await chatApp.getConversation(user1Address, user2Address);
      const conversation2 = await chatApp.getConversation(user2Address, user1Address);

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
      const user2Address = await user2.getAddress();
      
      await expect(
        chatApp.connect(user1).sendMessage(user2Address, "")
      ).to.be.revertedWith("Message content cannot be empty");
    });

    it("Should not allow sending message to yourself", async function () {
      const user1Address = await user1.getAddress();
      
      await expect(
        chatApp.connect(user1).sendMessage(user1Address, messageContent)
      ).to.be.revertedWith("Cannot send message to yourself");
    });

    it("Should handle multiple messages in conversation", async function () {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      
      await chatApp.connect(user1).sendMessage(user2Address, "First message");
      await chatApp.connect(user2).sendMessage(user1Address, "Second message");
      await chatApp.connect(user1).sendMessage(user2Address, "Third message");

      const conversation = await chatApp.getConversation(user1Address, user2Address);
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
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      const user3Address = await user3.getAddress();
      const members = [user2Address, user3Address];

      await expect(chatApp.connect(user1).createGroup(groupName, avatarHash, members))
        .to.emit(chatApp, "GroupCreated")
        .withArgs(1, groupName, user1Address);

      expect(await chatApp.groupCounter()).to.equal(1);
      expect(await chatApp.getTotalGroups()).to.equal(1);
    });

    it("Should store group details correctly", async function () {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      const user3Address = await user3.getAddress();
      const members = [user2Address, user3Address];
      
      await chatApp.connect(user1).createGroup(groupName, avatarHash, members);

      const groupDetails = await chatApp.getGroupDetails(1);
      expect(groupDetails.name).to.equal(groupName);
      expect(groupDetails.avatarHash).to.equal(avatarHash);
      expect(groupDetails.members.length).to.equal(3); // Creator + 2 members
      expect(groupDetails.members).to.include(user1Address); // Creator should be included
      expect(groupDetails.members).to.include(user2Address);
      expect(groupDetails.members).to.include(user3Address);
    });

    it("Should include creator in members if not already present", async function () {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      const user3Address = await user3.getAddress();
      const members = [user2Address, user3Address];
      
      await chatApp.connect(user1).createGroup(groupName, avatarHash, members);

      expect(await chatApp.isGroupMember(1, user1Address)).to.be.true;
      expect(await chatApp.isGroupMember(1, user2Address)).to.be.true;
      expect(await chatApp.isGroupMember(1, user3Address)).to.be.true;
    });

    it("Should not duplicate creator if already in members", async function () {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      const user3Address = await user3.getAddress();
      const members = [user1Address, user2Address, user3Address];
      
      await chatApp.connect(user1).createGroup(groupName, avatarHash, members);

      const groupDetails = await chatApp.getGroupDetails(1);
      expect(groupDetails.members.length).to.equal(3); // Should not duplicate creator
    });

    it("Should not allow empty group name", async function () {
      const user2Address = await user2.getAddress();
      const members = [user2Address];
      
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
      const user2Address = await user2.getAddress();
      const user3Address = await user3.getAddress();
      const members = [user2Address, user3Address];
      
      await chatApp.connect(user1).createGroup("Test Group", "hash", members);
      groupId = 1;
    });

    it("Should send group message successfully", async function () {
      const user1Address = await user1.getAddress();
      
      await expect(chatApp.connect(user1).sendGroupMessage(groupId, groupMessage))
        .to.emit(chatApp, "GroupMessageSent")
        .withArgs(groupId, user1Address, groupMessage, await hre.ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
    });

    it("Should store group message correctly", async function () {
      const user1Address = await user1.getAddress();
      
      await chatApp.connect(user1).sendGroupMessage(groupId, groupMessage);

      const conversation = await chatApp.connect(user1).getGroupConversation(groupId);
      expect(conversation.length).to.equal(1);
      expect(conversation[0].sender).to.equal(user1Address);
      expect(conversation[0].receiver).to.equal(hre.ethers.ZeroAddress); // No specific receiver for group messages
      expect(conversation[0].content).to.equal(groupMessage);
      expect(conversation[0].timestamp).to.be.greaterThan(0);
    });

    it("Should allow all group members to send messages", async function () {
      await chatApp.connect(user1).sendGroupMessage(groupId, "Message from user1");
      await chatApp.connect(user2).sendGroupMessage(groupId, "Message from user2");
      await chatApp.connect(user3).sendGroupMessage(groupId, "Message from user3");

      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      const user3Address = await user3.getAddress();
      
      const conversation = await chatApp.connect(user1).getGroupConversation(groupId);
      expect(conversation.length).to.equal(3);
      expect(conversation[0].sender).to.equal(user1Address);
      expect(conversation[1].sender).to.equal(user2Address);
      expect(conversation[2].sender).to.equal(user3Address);
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
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      
      const id1 = await chatApp.getConversationId(user1Address, user2Address);
      const id2 = await chatApp.getConversationId(user2Address, user1Address);
      
      expect(id1).to.equal(id2);
    });

    it("Should correctly identify group membership", async function () {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      const user3Address = await user3.getAddress();
      const ownerAddress = await owner.getAddress();
      const members = [user2Address, user3Address];
      
      await chatApp.connect(user1).createGroup("Test Group", "hash", members);

      expect(await chatApp.isGroupMember(1, user1Address)).to.be.true;
      expect(await chatApp.isGroupMember(1, user2Address)).to.be.true;
      expect(await chatApp.isGroupMember(1, user3Address)).to.be.true;
      expect(await chatApp.isGroupMember(1, ownerAddress)).to.be.false;
    });

    it("Should return false for invalid group ID in membership check", async function () {
      const user1Address = await user1.getAddress();
      
      expect(await chatApp.isGroupMember(999, user1Address)).to.be.false;
      expect(await chatApp.isGroupMember(0, user1Address)).to.be.false;
    });
  });
});
