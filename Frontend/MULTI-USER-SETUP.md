# 👥 Multi-User ChatDApp Setup Guide

## 🎯 Overview
Your ChatDApp is designed for multiple users to register, discover each other, and chat in real-time. Here's how to set up and test with multiple users.

## 🔧 Prerequisites Setup

### 1. Firebase Configuration (Required)
First, ensure Firebase is properly configured:

```bash
# In your .env.local file
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 2. Firestore Security Rules
Update your Firestore rules to allow multi-user access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Messages collection - allow read/write for all authenticated users
    match /messages/{messageId} {
      allow read, write: if true; // For testing, allow all access
    }
    
    // Typing indicators
    match /typing/{typingId} {
      allow read, write: if true; // For testing, allow all access
    }
  }
}
```

## 👥 Multi-User Testing Methods

### Method 1: Multiple Browser Profiles (Recommended)
**Best for testing with different wallets**

1. **Create Browser Profiles**:
   - Chrome: Settings → People → Add Person
   - Firefox: about:profiles → Create New Profile
   - Safari: Develop → User Agent (or use different browsers)

2. **Setup Each Profile**:
   - Install MetaMask in each profile
   - Create different wallet addresses
   - Fund with Sepolia ETH (use faucet)
   - Open your app: `http://localhost:3000`

### Method 2: Different Browsers
**Simple but limited**

1. **Use Different Browsers**:
   - Chrome with Wallet A
   - Firefox with Wallet B  
   - Safari with Wallet C
   - Edge with Wallet D

2. **Each browser gets its own wallet and session**

### Method 3: Incognito/Private Windows
**Quick testing method**

1. **Open multiple incognito windows**
2. **Each window acts as separate user session**
3. **Install wallet extensions in each if needed**

### Method 4: Multiple Devices
**Most realistic testing**

1. **Desktop**: Your main development setup
2. **Mobile**: Use mobile wallet apps (MetaMask Mobile, Trust Wallet)
3. **Tablet**: Another device for testing
4. **Friend's Device**: Get others to test with you

## 🚀 Step-by-Step Multi-User Setup

### Step 1: Prepare Test Wallets
```bash
# You'll need multiple wallets with Sepolia ETH
# Get testnet ETH from: https://sepoliafaucet.com/

Wallet 1: 0x1234... (Alice)
Wallet 2: 0x5678... (Bob)  
Wallet 3: 0x9ABC... (Charlie)
```

### Step 2: Register Users
For each wallet/browser profile:

1. **Visit**: `http://localhost:3000`
2. **Connect Wallet**: Click "Connect Wallet"
3. **Register ENS**: 
   - Enter unique name: `alice`, `bob`, `charlie`
   - Upload different avatars
   - Complete registration transaction
4. **Access Dashboard**: Auto-redirected after registration

### Step 3: Verify User Discovery
- Each user should see others in their contact list
- Names should display as `alice.eth`, `bob.eth`, `charlie.eth`
- Avatars should load from IPFS

### Step 4: Test Real-time Chat
1. **User A**: Select User B from contacts
2. **User A**: Send message "Hello Bob!"
3. **User B**: Should receive message instantly
4. **User B**: Reply "Hi Alice!"
5. **Both**: Should see real-time conversation

## 💬 Testing Scenarios

### Scenario 1: Direct Messages
```
Alice (Browser 1) → Bob (Browser 2)
1. Alice selects Bob from contacts
2. Alice types "Hey Bob, how are you?"
3. Bob sees message instantly
4. Bob replies "Great! How about you?"
5. Real-time conversation continues
```

### Scenario 2: Group Chat
```
Alice creates group "Web3 Devs"
1. Alice clicks "+" next to Groups
2. Adds Bob and Charlie as members
3. Alice sends "Welcome to our dev group!"
4. Bob and Charlie see group message
5. All three can chat in group
```

### Scenario 3: Typing Indicators
```
While Alice types...
1. Bob sees "alice.eth is typing..."
2. Indicator disappears after Alice stops
3. Works in both direct and group chats
```

## 🔍 Troubleshooting Multi-User Issues

### Issue: Users Can't See Each Other
**Solution**: 
- Ensure all users completed registration
- Check smart contract on Sepolia: users must be registered on-chain
- Verify contract addresses in `lib/contracts.ts`

### Issue: Messages Not Syncing
**Solution**:
- Check Firebase configuration
- Verify Firestore security rules allow access
- Ensure all users are connected to same Firebase project

### Issue: ENS Names Not Displaying
**Solution**:
- Confirm user registration completed successfully
- Check transaction on Sepolia explorer
- Verify user details are stored on-chain

### Issue: Avatars Not Loading
**Solution**:
- Check IPFS gateway accessibility
- Verify avatar hashes are stored correctly
- Try different IPFS gateways if needed

## 🌐 Production Deployment for Multiple Users

### Option 1: Vercel Deployment
```bash
# Deploy to Vercel for public access
npm install -g vercel
vercel --prod

# Share URL with users: https://your-app.vercel.app
```

### Option 2: Netlify Deployment
```bash
# Build and deploy
npm run build
# Upload dist folder to Netlify
```

### Option 3: Local Network Access
```bash
# Allow local network access
npm run dev -- --host 0.0.0.0

# Share your local IP: http://192.168.1.100:3000
# Others on same network can access
```

## 📱 Mobile Testing

### Mobile Wallet Setup
1. **Install Mobile Wallets**:
   - MetaMask Mobile
   - Trust Wallet
   - Rainbow Wallet

2. **Configure for Sepolia**:
   - Add Sepolia network
   - Import test wallet or create new
   - Get testnet ETH

3. **Access App**:
   - Open mobile browser
   - Visit your app URL
   - Connect mobile wallet

## 🎮 Demo Script for Multiple Users

### 5-Minute Demo Flow
```
Minute 1: Setup
- User A (Alice): Connect wallet, register as "alice"
- User B (Bob): Connect wallet, register as "bob"

Minute 2: Discovery
- Both users see each other in contacts
- Verify ENS names show as "alice.eth", "bob.eth"

Minute 3: Direct Chat
- Alice selects Bob, sends "Hello Bob!"
- Bob receives instantly, replies "Hi Alice!"

Minute 4: Group Chat
- Alice creates group "Demo Group"
- Adds Bob to group
- Both chat in group

Minute 5: Advanced Features
- Test typing indicators
- Send multiple messages
- Verify real-time sync
```

## 🔐 Security Considerations

### For Testing
- Use testnet only (Sepolia)
- Don't use real funds
- Test wallets can be shared safely

### For Production
- Users need real wallets
- Mainnet deployment required
- Implement proper security rules
- Consider rate limiting

## 📊 Monitoring Multi-User Activity

### Firebase Console
- Monitor real-time database activity
- View message collections
- Check user authentication

### Smart Contract Events
- Monitor UserRegistered events
- Track MessageSent events
- Verify GroupCreated events

---

## 🎉 Success Checklist

Your multi-user setup is working when:
- ✅ Multiple users can register with different wallets
- ✅ Users appear in each other's contact lists
- ✅ Real-time messaging works between any users
- ✅ Group chats function with multiple participants
- ✅ ENS names and avatars display correctly
- ✅ Typing indicators work across users
- ✅ Messages persist and sync in real-time

**Your ChatDApp is now ready for multiple users!** 🚀
