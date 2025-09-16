# Deployment Guide

## Environment Variables

Before deploying, you need to set up the following environment variables:

### Required Variables

1. **Supabase Configuration**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **WalletConnect Configuration**
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

### Setting Up Environment Variables

#### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with the appropriate values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

#### For Local Development

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and fill in your actual values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```

## Supabase Setup

### Database Schema

The application requires the following Supabase tables:

1. **users**
   ```sql
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     wallet_address TEXT UNIQUE NOT NULL,
     ens_name TEXT,
     avatar_hash TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **messages**
   ```sql
   CREATE TABLE messages (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     sender_wallet TEXT NOT NULL,
     receiver_wallet TEXT NOT NULL,
     content TEXT NOT NULL,
     message_type TEXT DEFAULT 'text',
     timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     is_read BOOLEAN DEFAULT FALSE
   );
   ```

3. **groups**
   ```sql
   CREATE TABLE groups (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     creator_wallet TEXT NOT NULL,
     avatar_hash TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. **group_members**
   ```sql
   CREATE TABLE group_members (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
     wallet_address TEXT NOT NULL,
     role TEXT DEFAULT 'member',
     joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **group_messages**
   ```sql
   CREATE TABLE group_messages (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
     sender_wallet TEXT NOT NULL,
     content TEXT NOT NULL,
     message_type TEXT DEFAULT 'text',
     timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

### Row Level Security (RLS)

Enable RLS on all tables and create appropriate policies for your use case.

## Deployment Steps

1. **Set up Supabase project and database schema**
2. **Configure environment variables in your deployment platform**
3. **Deploy the application**

## Troubleshooting

### Build Errors

- **IndexedDB Error**: The app now handles server-side rendering gracefully
- **Supabase URL Required**: Ensure environment variables are properly set
- **Missing Dependencies**: Run `pnpm install` to ensure all packages are installed

### Runtime Issues

- **Wallet Connection**: Ensure WalletConnect project ID is valid
- **Database Connection**: Verify Supabase URL and anon key are correct
- **Missing Features**: Check that all required Supabase tables exist

## Notes

- The application will work without Supabase configuration but messaging features will be disabled
- All environment variables must be prefixed with `NEXT_PUBLIC_` to be available in the browser
- The app uses client-side rendering for all interactive features
