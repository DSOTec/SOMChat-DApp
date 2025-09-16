// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UserRegistry
 * @dev A smart contract for registering users with ENS names and avatar hashes
 */
contract UserRegistry {
    // User struct to store user information
    struct User {
        string ensName;
        string avatarHash; // IPFS URL or CID
        bool registered;
    }

    // Mapping from user address to User struct
    mapping(address => User) public users;

    // Array to keep track of all registered user addresses
    address[] public allUsers;

    // Events
    event UserRegistered(address indexed userAddress, string ensName, string avatarHash);

    /**
     * @dev Register a new user with ENS name and avatar hash
     * @param ensName The ENS name of the user
     * @param avatarHash The IPFS hash or URL for the user's avatar
     */
    function registerUser(string memory ensName, string memory avatarHash) external {
        require(!users[msg.sender].registered, "User is already registered");
        require(bytes(ensName).length > 0, "ENS name cannot be empty");
        
        // Store user details
        users[msg.sender] = User({
            ensName: ensName,
            avatarHash: avatarHash,
            registered: true
        });

        // Add user address to allUsers array
        allUsers.push(msg.sender);

        // Emit event
        emit UserRegistered(msg.sender, ensName, avatarHash);
    }

    /**
     * @dev Get all registered user addresses
     * @return Array of all registered user addresses
     */
    function getAllUsers() external view returns (address[] memory) {
        return allUsers;
    }

    /**
     * @dev Get the total number of registered users
     * @return The count of registered users
     */
    function getUserCount() external view returns (uint256) {
        return allUsers.length;
    }

    /**
     * @dev Check if a user is registered
     * @param userAddress The address to check
     * @return True if the user is registered, false otherwise
     */
    function isUserRegistered(address userAddress) external view returns (bool) {
        return users[userAddress].registered;
    }

    /**
     * @dev Get user details by address
     * @param userAddress The address of the user
     * @return ensName The ENS name of the user
     * @return avatarHash The avatar hash of the user
     * @return registered Whether the user is registered
     */
    function getUserDetails(address userAddress) external view returns (string memory ensName, string memory avatarHash, bool registered) {
        User memory user = users[userAddress];
        return (user.ensName, user.avatarHash, user.registered);
    }
}
