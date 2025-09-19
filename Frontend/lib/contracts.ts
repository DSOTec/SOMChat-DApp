import { Address } from 'viem'

// Contract addresses on Sepolia
export const CONTRACTS = {
  CHAT_APP: '0xf56938dF072E7558a7465304C46BBa2128F45e7F' as Address,
  USER_REGISTRY: '0x47E3603Fa8f081b66b150047b9ff8d6d357bB175' as Address,
} as const

// ChatApp ABI - Complete ABI with Chainlink automation
export const CHAT_APP_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: '_interval', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'groupId', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'name', type: 'string' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' }
    ],
    name: 'GroupCreated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'groupId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' },
      { indexed: false, internalType: 'string', name: 'message', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' }
    ],
    name: 'GroupMessageSent',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'string', name: 'message', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' }
    ],
    name: 'MessageSent',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'groupId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' }
    ],
    name: 'OraclePricesPosted',
    type: 'event'
  },
  {
    inputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    name: 'checkUpkeep',
    outputs: [
      { internalType: 'bool', name: 'upkeepNeeded', type: 'bool' },
      { internalType: 'bytes', name: 'performData', type: 'bytes' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'avatarHash', type: 'string' },
      { internalType: 'address[]', name: 'members', type: 'address[]' }
    ],
    name: 'createGroup',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'defaultGroupId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'feedNames',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'user1', type: 'address' },
      { internalType: 'address', name: 'user2', type: 'address' }
    ],
    name: 'getConversation',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'string', name: 'content', type: 'string' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' }
        ],
        internalType: 'struct ChatApp.Message[]',
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'user1', type: 'address' },
      { internalType: 'address', name: 'user2', type: 'address' }
    ],
    name: 'getConversationId',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'groupId', type: 'uint256' }],
    name: 'getGroupConversation',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'string', name: 'content', type: 'string' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' }
        ],
        internalType: 'struct ChatApp.Message[]',
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'groupId', type: 'uint256' }],
    name: 'getGroupDetails',
    outputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'avatarHash', type: 'string' },
      { internalType: 'address[]', name: 'members', type: 'address[]' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'feed', type: 'address' }],
    name: 'getLatestPrice',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getTotalGroups',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'groupCounter',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'groups',
    outputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'avatarHash', type: 'string' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'interval',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'groupId', type: 'uint256' },
      { internalType: 'address', name: 'user', type: 'address' }
    ],
    name: 'isGroupMember',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'sender', type: 'address' }],
    name: 'isOracleMessage',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [],
    name: 'lastTimeStamp',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    name: 'performUpkeep',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'groupId', type: 'uint256' }],
    name: 'postPriceToGroup',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'groupId', type: 'uint256' },
      { internalType: 'string', name: 'content', type: 'string' }
    ],
    name: 'sendGroupMessage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'string', name: 'content', type: 'string' }
    ],
    name: 'sendMessage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_newDefaultGroupId', type: 'uint256' }],
    name: 'updateDefaultGroupId',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_newInterval', type: 'uint256' }],
    name: 'updateInterval',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
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
