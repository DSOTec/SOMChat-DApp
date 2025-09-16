# Deployment Guide

## Environment Variables

Before deploying, you need to set up the following environment variables:

### Required Variables

**WalletConnect Configuration**
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Setting Up Environment Variables

#### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the variable:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

#### For Local Development

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and fill in your actual values:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```

## Smart Contract Integration

This application focuses on smart contract interactions for messaging functionality. The chat features are powered by on-chain smart contracts rather than external databases.

## Deployment Steps

1. **Configure environment variables in your deployment platform**
2. **Deploy the application**
3. **Ensure smart contracts are deployed and accessible**

## Troubleshooting

### Build Errors

- **Missing Dependencies**: Run `pnpm install` to ensure all packages are installed
- **Font Loading Issues**: Network timeouts may occur during build, these are usually temporary

### Runtime Issues

- **Wallet Connection**: Ensure WalletConnect project ID is valid
- **Smart Contract Interaction**: Verify contracts are deployed on the correct network

## Notes

- The application uses smart contracts for all messaging functionality
- All environment variables must be prefixed with `NEXT_PUBLIC_` to be available in the browser
- The app uses client-side rendering for all interactive features
