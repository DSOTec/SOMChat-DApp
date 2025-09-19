import { Address } from 'viem'

// Contract addresses on Sepolia
export const CONTRACTS = {
  CHAT_APP: '0x61e7Ec55c10A779D8c39F61e8184Ac654781BA1A' as Address,
  USER_REGISTRY: '0xf078dbeB5c2FF1dB3063564077D71A3983e10AEb' as Address,
} as const

// ChatApp ABI
export const CHAT_APP_ABI = [
  {
    type: 'function',
    name: 'sendMessage',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'content', type: 'string' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'getConversation',
    inputs: [
      { name: 'user1', type: 'address' },
      { name: 'user2', type: 'address' }
    ],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'sender', type: 'address' },
          { name: 'receiver', type: 'address' },
          { name: 'content', type: 'string' },
          { name: 'timestamp', type: 'uint256' }
        ]
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'createGroup',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'avatarHash', type: 'string' },
      { name: 'members', type: 'address[]' }
    ],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'sendGroupMessage',
    inputs: [
      { name: 'groupId', type: 'uint256' },
      { name: 'content', type: 'string' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'getGroupConversation',
    inputs: [{ name: 'groupId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'sender', type: 'address' },
          { name: 'receiver', type: 'address' },
          { name: 'content', type: 'string' },
          { name: 'timestamp', type: 'uint256' }
        ]
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getGroupDetails',
    inputs: [{ name: 'groupId', type: 'uint256' }],
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'avatarHash', type: 'string' },
      { name: 'members', type: 'address[]' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'isGroupMember',
    inputs: [
      { name: 'groupId', type: 'uint256' },
      { name: 'user', type: 'address' }
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getTotalGroups',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'groupCounter',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'event',
    name: 'MessageSent',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'message', type: 'string', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'GroupCreated',
    inputs: [
      { name: 'groupId', type: 'uint256', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'creator', type: 'address', indexed: true }
    ]
  },
  {
    type: 'event',
    name: 'GroupMessageSent',
    inputs: [
      { name: 'groupId', type: 'uint256', indexed: true },
      { name: 'sender', type: 'address', indexed: true },
      { name: 'message', type: 'string', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false }
    ]
  }
] as const

// UserRegistry ABI
export const USER_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'registerUser',
    inputs: [
      { name: 'ensName', type: 'string' },
      { name: 'avatarHash', type: 'string' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'getAllUsers',
    inputs: [],
    outputs: [{ type: 'address[]' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getUserCount',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'isUserRegistered',
    inputs: [{ name: 'userAddress', type: 'address' }],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getUserDetails',
    inputs: [{ name: 'userAddress', type: 'address' }],
    outputs: [
      { name: 'ensName', type: 'string' },
      { name: 'avatarHash', type: 'string' },
      { name: 'registered', type: 'bool' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'users',
    inputs: [{ name: '', type: 'address' }],
    outputs: [
      { name: 'ensName', type: 'string' },
      { name: 'avatarHash', type: 'string' },
      { name: 'registered', type: 'bool' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'event',
    name: 'UserRegistered',
    inputs: [
      { name: 'userAddress', type: 'address', indexed: true },
      { name: 'ensName', type: 'string', indexed: false },
      { name: 'avatarHash', type: 'string', indexed: false }
    ]
  },
  {
    name: 'deleteUser',
    type: 'function',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'deleteOtherUser',
    type: 'function',
    inputs: [{ name: 'userAddress', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'UserDeleted',
    type: 'event',
    inputs: [
      { name: 'userAddress', type: 'address', indexed: true }
    ]
  }
] as const
