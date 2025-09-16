// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChatApp
 * @dev A smart contract for peer-to-peer and group messaging
 */
contract ChatApp {
    // Message struct for individual conversations
    struct Message {
        address sender;
        address receiver;
        string content;
        uint256 timestamp;
    }

    // Group struct for group conversations
    struct Group {
        string name;
        string avatarHash;
        address[] members;
    }

    // Mapping from conversation ID to array of messages
    mapping(bytes32 => Message[]) private conversations;

    // Mapping from group ID to Group struct
    mapping(uint256 => Group) public groups;

    // Mapping from group ID to array of messages
    mapping(uint256 => Message[]) private groupConversations;

    // Counter for group IDs
    uint256 public groupCounter;

    // Events
    event MessageSent(address indexed from, address indexed to, string message, uint256 timestamp);
    event GroupCreated(uint256 indexed groupId, string name, address indexed creator);
    event GroupMessageSent(uint256 indexed groupId, address indexed sender, string message, uint256 timestamp);

    /**
     * @dev Send a message to another user
     * @param to The address of the receiver
     * @param content The message content
     */
    function sendMessage(address to, string memory content) external {
        require(to != address(0), "Invalid receiver address");
        require(bytes(content).length > 0, "Message content cannot be empty");
        require(to != msg.sender, "Cannot send message to yourself");

        // Generate conversation ID
        bytes32 conversationId = getConversationId(msg.sender, to);

        // Create and store message
        Message memory newMessage = Message({
            sender: msg.sender,
            receiver: to,
            content: content,
            timestamp: block.timestamp
        });

        conversations[conversationId].push(newMessage);

        // Emit event
        emit MessageSent(msg.sender, to, content, block.timestamp);
    }

    /**
     * @dev Get conversation between two users
     * @param user1 First user address
     * @param user2 Second user address
     * @return Array of messages in the conversation
     */
    function getConversation(address user1, address user2) external view returns (Message[] memory) {
        bytes32 conversationId = getConversationId(user1, user2);
        return conversations[conversationId];
    }

    /**
     * @dev Create a new group
     * @param name The name of the group
     * @param avatarHash The IPFS hash for the group avatar
     * @param members Array of member addresses
     * @return groupId The ID of the created group
     */
    function createGroup(string memory name, string memory avatarHash, address[] memory members) external returns (uint256) {
        require(bytes(name).length > 0, "Group name cannot be empty");
        require(members.length > 0, "Group must have at least one member");

        // Increment group counter
        groupCounter++;
        uint256 groupId = groupCounter;

        // Add creator to members if not already included
        bool creatorIncluded = false;
        for (uint256 i = 0; i < members.length; i++) {
            require(members[i] != address(0), "Invalid member address");
            if (members[i] == msg.sender) {
                creatorIncluded = true;
            }
        }

        // Create members array with creator included
        address[] memory finalMembers;
        if (creatorIncluded) {
            finalMembers = members;
        } else {
            finalMembers = new address[](members.length + 1);
            finalMembers[0] = msg.sender;
            for (uint256 i = 0; i < members.length; i++) {
                finalMembers[i + 1] = members[i];
            }
        }

        // Create and store group
        groups[groupId] = Group({
            name: name,
            avatarHash: avatarHash,
            members: finalMembers
        });

        // Emit event
        emit GroupCreated(groupId, name, msg.sender);

        return groupId;
    }

    /**
     * @dev Send a message to a group
     * @param groupId The ID of the group
     * @param content The message content
     */
    function sendGroupMessage(uint256 groupId, string memory content) external {
        require(groupId > 0 && groupId <= groupCounter, "Invalid group ID");
        require(bytes(content).length > 0, "Message content cannot be empty");
        require(isGroupMember(groupId, msg.sender), "Not a member of this group");

        // Create and store message
        Message memory newMessage = Message({
            sender: msg.sender,
            receiver: address(0), // No specific receiver for group messages
            content: content,
            timestamp: block.timestamp
        });

        groupConversations[groupId].push(newMessage);

        // Emit event
        emit GroupMessageSent(groupId, msg.sender, content, block.timestamp);
    }

    /**
     * @dev Get group conversation messages
     * @param groupId The ID of the group
     * @return Array of messages in the group conversation
     */
    function getGroupConversation(uint256 groupId) external view returns (Message[] memory) {
        require(groupId > 0 && groupId <= groupCounter, "Invalid group ID");
        require(isGroupMember(groupId, msg.sender), "Not a member of this group");
        
        return groupConversations[groupId];
    }

    /**
     * @dev Get group details
     * @param groupId The ID of the group
     * @return name The group name
     * @return avatarHash The group avatar hash
     * @return members Array of member addresses
     */
    function getGroupDetails(uint256 groupId) external view returns (string memory name, string memory avatarHash, address[] memory members) {
        require(groupId > 0 && groupId <= groupCounter, "Invalid group ID");
        
        Group memory group = groups[groupId];
        return (group.name, group.avatarHash, group.members);
    }

    /**
     * @dev Check if an address is a member of a group
     * @param groupId The ID of the group
     * @param user The address to check
     * @return True if the user is a member, false otherwise
     */
    function isGroupMember(uint256 groupId, address user) public view returns (bool) {
        if (groupId == 0 || groupId > groupCounter) {
            return false;
        }

        address[] memory members = groups[groupId].members;
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == user) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Generate conversation ID from two addresses
     * @param user1 First user address
     * @param user2 Second user address
     * @return Conversation ID as bytes32
     */
    function getConversationId(address user1, address user2) public pure returns (bytes32) {
        // Ensure consistent ordering to generate same ID regardless of parameter order
        if (user1 < user2) {
            return keccak256(abi.encodePacked(user1, user2));
        } else {
            return keccak256(abi.encodePacked(user2, user1));
        }
    }

    /**
     * @dev Get the total number of groups created
     * @return The current group counter
     */
    function getTotalGroups() external view returns (uint256) {
        return groupCounter;
    }
}
