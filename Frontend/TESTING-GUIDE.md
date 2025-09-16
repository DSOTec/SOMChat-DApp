# 🚀 SOMChat Testing Guide (PNPM Setup)

## Prerequisites

### 1. Install Dependencies
```bash
cd Frontend
pnpm install
```

### 2. Get Sepolia ETH
- Visit [Sepolia Faucet](https://sepoliafaucet.com/) or [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
- Get some Sepolia ETH for testing transactions

### 3. Wallet Setup
- Install MetaMask or any Web3 wallet
- Add Sepolia network if not already added:
  - Network Name: Sepolia
  - RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
  - Chain ID: 11155111
  - Currency Symbol: ETH

## 🧪 Testing Flow

### Step 1: Start the Application
```bash
pnpm dev
```
Visit: http://localhost:3000

### Step 2: Landing Page Test
- ✅ Page loads correctly
- ✅ "Connect Wallet" button appears
- ✅ Theme toggle works
- ✅ Responsive design on mobile

### Step 3: Wallet Connection Test
- Click "Connect Wallet"
- ✅ RainbowKit modal opens
- ✅ Multiple wallet options available
- ✅ Connect with your preferred wallet
- ✅ Wallet address displays correctly
- ✅ Network switching to Sepolia works

### Step 4: Registration Test
After connecting wallet, you should be redirected to `/register`:

- ✅ Registration form loads
- ✅ Wallet address displays correctly
- ✅ Enter ENS name (e.g., "testuser123")
- ✅ Upload avatar (optional)
- ✅ Click "Register & Continue"
- ✅ Transaction confirmation in wallet
- ✅ Transaction success notification
- ✅ Redirect to dashboard after confirmation

### Step 5: Dashboard Test
After registration, you should see the chat dashboard:

**Sidebar Tests:**
- ✅ Your ENS name displays in header
- ✅ Online status indicator shows
- ✅ Search functionality works
- ✅ Contacts section shows other registered users
- ✅ Groups section displays (may be empty initially)
- ✅ Mobile sidebar toggle works

**Chat Tests:**
- ✅ Click on a contact to open chat
- ✅ Chat header shows contact info
- ✅ Message input field appears
- ✅ Type a message and press Enter or click Send
- ✅ Transaction confirmation in wallet
- ✅ Message appears in chat after confirmation
- ✅ Timestamp displays correctly

**Group Tests:**
- ✅ Click "+" button next to Groups
- ✅ Create group modal opens
- ✅ Enter group name and select members
- ✅ Create group transaction
- ✅ Group appears in sidebar
- ✅ Send group messages

## 🔍 What to Look For

### Success Indicators
- ✅ No console errors
- ✅ Smooth wallet connection
- ✅ Fast transaction confirmations
- ✅ Real-time UI updates
- ✅ Responsive design on all devices
- ✅ Proper error handling

### Common Issues & Solutions

**Issue: "Network not supported"**
- Solution: Switch to Sepolia network in your wallet

**Issue: "Transaction failed"**
- Solution: Ensure you have enough Sepolia ETH for gas fees

**Issue: "User not registered" error**
- Solution: Complete the registration process first

**Issue: Messages not loading**
- Solution: Refresh the page (Phase 2 will add real-time updates)

**Issue: ENS name already taken**
- Solution: Try a different ENS name

## 📱 Mobile Testing

Test on mobile devices or browser dev tools:
- ✅ Wallet connection works on mobile
- ✅ Registration form is mobile-friendly
- ✅ Chat interface is responsive
- ✅ Sidebar slides in/out properly
- ✅ Touch interactions work smoothly

## 🔧 Development Testing

### Console Commands
Open browser console and test:

```javascript
// Check if wallet is connected
window.ethereum?.selectedAddress

// Check current network
window.ethereum?.networkVersion

// Test contract addresses
console.log('ChatApp:', '0x61e7Ec55c10A779D8c39F61e8184Ac654781BA1A')
console.log('UserRegistry:', '0xf078dbeB5c2FF1dB3063564077D71A3983e10AEb')
```

### Network Verification
Verify contracts on Sepolia Etherscan:
- [ChatApp Contract](https://sepolia.etherscan.io/address/0x61e7Ec55c10A779D8c39F61e8184Ac654781BA1A)
- [UserRegistry Contract](https://sepolia.etherscan.io/address/0xf078dbeB5c2FF1dB3063564077D71A3983e10AEb)

## 🎯 Performance Benchmarks

### Expected Load Times
- Landing page: < 2 seconds
- Wallet connection: < 5 seconds
- Registration: < 3 seconds
- Dashboard load: < 4 seconds
- Message send: < 10 seconds (depends on network)

### Gas Usage (Approximate)
- User registration: ~150,000 gas
- Send message: ~130,000 gas
- Create group: ~200,000 gas
- Send group message: ~120,000 gas

## 🚨 Troubleshooting

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev
```

### Wallet Issues
- Clear browser cache
- Reset wallet connection
- Try different wallet provider

### Transaction Issues
- Check Sepolia ETH balance
- Increase gas limit if needed
- Wait for network confirmation

## ✅ Test Checklist

### Basic Functionality
- [ ] Landing page loads
- [ ] Wallet connects successfully
- [ ] Registration completes
- [ ] Dashboard displays
- [ ] Can send messages
- [ ] Can create groups
- [ ] Mobile responsive

### Advanced Features
- [ ] Message history loads
- [ ] Group messaging works
- [ ] Search functionality
- [ ] Theme switching
- [ ] Error handling
- [ ] Transaction feedback

### Cross-Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers

---

## 🎉 Success Criteria

Your Web3 chat application is working correctly if:
1. Users can connect wallets seamlessly
2. Registration process completes without errors
3. Messages are sent and received via blockchain
4. Groups can be created and used
5. UI is responsive and user-friendly
6. All transactions confirm properly on Sepolia

**Ready for Phase 2 implementation!** 🚀
