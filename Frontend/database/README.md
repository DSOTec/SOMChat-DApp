# SOMChat Database Schema

This directory contains the database schema and setup files for the SOMChat decentralized messaging application.

## Overview

The database uses **Supabase** (PostgreSQL) to store user data, messages, and group information while maintaining security through Row Level Security (RLS) policies.

## Schema Structure

### Core Tables

1. **`users`** - User profiles and wallet addresses
2. **`messages`** - Direct messages between users
3. **`groups`** - Group chat information
4. **`group_members`** - Group membership junction table
5. **`group_messages`** - Messages within groups

### Key Features

- **Row Level Security (RLS)** - Ensures users can only access their own data
- **Realtime subscriptions** - Live message updates
- **Optimized indexes** - Fast query performance
- **Foreign key constraints** - Data integrity
- **Automatic timestamps** - Created/updated tracking

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Run Schema

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Execute the script

### 3. Configure Environment

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Set Up Authentication

The app uses wallet-based authentication. When a user connects their wallet:

1. Set the current user context: `SET app.current_user_wallet = '0x...'`
2. This enables RLS policies to work correctly

## Security Model

### Row Level Security Policies

- **Users**: Can read all profiles, update only their own
- **Messages**: Can only see messages they sent/received
- **Groups**: Can only see groups they're members of
- **Group Messages**: Can only see messages in groups they belong to

### Authentication Context

The app sets `app.current_user_wallet` session variable to enable RLS policies. This should be set whenever a user connects their wallet.

## Realtime Features

Tables enabled for realtime subscriptions:
- `messages` - Live direct messages
- `group_messages` - Live group messages  
- `users` - Live user status updates

## Performance Optimizations

### Indexes Created

- Wallet address lookups
- Message conversations (sender + receiver + timestamp)
- Group memberships
- Timestamp-based queries for message ordering

### Query Patterns

The schema is optimized for:
- Fast message retrieval by conversation
- Efficient group membership checks
- Quick user profile lookups
- Realtime message streaming

## Migration Notes

If updating the schema:

1. Always use `IF NOT EXISTS` for new tables/indexes
2. Test RLS policies thoroughly
3. Update realtime subscriptions if needed
4. Consider data migration scripts for existing data

## Troubleshooting

### Common Issues

1. **RLS blocking queries**: Ensure `app.current_user_wallet` is set
2. **Realtime not working**: Check table is added to `supabase_realtime` publication
3. **Slow queries**: Verify indexes are created properly

### Debug Queries

```sql
-- Check current user context
SELECT current_setting('app.current_user_wallet');

-- Test RLS policies
SELECT * FROM messages WHERE sender_wallet = 'your_wallet';

-- Check realtime subscriptions
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```
