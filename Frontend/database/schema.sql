-- SUPABASE DATABASE SCHEMA FOR SOMCHAT DAPP
-- This file contains the database schema for the SOMChat decentralized messaging application

-- USERS TABLE
-- Stores user registration data including wallet addresses and ENS names
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  ens_name TEXT,
  avatar_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MESSAGES TABLE
-- Stores all direct messages between users
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_wallet TEXT NOT NULL,
  receiver_wallet TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'image', 'file'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_sender FOREIGN KEY (sender_wallet) REFERENCES users(wallet_address) ON DELETE CASCADE,
  CONSTRAINT fk_receiver FOREIGN KEY (receiver_wallet) REFERENCES users(wallet_address) ON DELETE CASCADE
);

-- GROUPS TABLE
-- Stores group chat information
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_wallet TEXT NOT NULL,
  avatar_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_creator FOREIGN KEY (creator_wallet) REFERENCES users(wallet_address) ON DELETE CASCADE
);

-- GROUP_MEMBERS TABLE
-- Junction table for group memberships
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  role TEXT DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_member FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE,
  UNIQUE(group_id, wallet_address)
);

-- GROUP_MESSAGES TABLE
-- Stores all group messages
CREATE TABLE IF NOT EXISTS group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  sender_wallet TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'image', 'file'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_group_msg FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_group_sender FOREIGN KEY (sender_wallet) REFERENCES users(wallet_address) ON DELETE CASCADE
);

-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_ens ON users(ens_name);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_wallet);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_wallet);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_wallet, receiver_wallet, timestamp DESC);

-- Groups table indexes
CREATE INDEX IF NOT EXISTS idx_groups_creator ON groups(creator_wallet);

-- Group members table indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_wallet ON group_members(wallet_address);

-- Group messages table indexes
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_sender ON group_messages(sender_wallet);
CREATE INDEX IF NOT EXISTS idx_group_messages_timestamp ON group_messages(timestamp DESC);

-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- Users can read all user profiles (for contact discovery)
CREATE POLICY "Users can read all profiles" ON users
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (wallet_address = current_setting('app.current_user_wallet'));

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (wallet_address = current_setting('app.current_user_wallet'));

-- Messages policies - users can only see messages they sent or received
CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT USING (
    sender_wallet = current_setting('app.current_user_wallet') OR 
    receiver_wallet = current_setting('app.current_user_wallet')
  );

-- Users can insert messages they send
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_wallet = current_setting('app.current_user_wallet'));

-- Users can update read status of messages sent to them
CREATE POLICY "Users can update message read status" ON messages
  FOR UPDATE USING (receiver_wallet = current_setting('app.current_user_wallet'));

-- Groups policies - users can read groups they're members of
CREATE POLICY "Users can read member groups" ON groups
  FOR SELECT USING (
    id IN (
      SELECT group_id FROM group_members 
      WHERE wallet_address = current_setting('app.current_user_wallet')
    )
  );

-- Users can create groups
CREATE POLICY "Users can create groups" ON groups
  FOR INSERT WITH CHECK (creator_wallet = current_setting('app.current_user_wallet'));

-- Group creators can update their groups
CREATE POLICY "Creators can update groups" ON groups
  FOR UPDATE USING (creator_wallet = current_setting('app.current_user_wallet'));

-- Group members policies
CREATE POLICY "Users can read group memberships" ON group_members
  FOR SELECT USING (
    wallet_address = current_setting('app.current_user_wallet') OR
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE wallet_address = current_setting('app.current_user_wallet')
    )
  );

-- Group messages policies
CREATE POLICY "Members can read group messages" ON group_messages
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE wallet_address = current_setting('app.current_user_wallet')
    )
  );

-- Members can send group messages
CREATE POLICY "Members can send group messages" ON group_messages
  FOR INSERT WITH CHECK (
    sender_wallet = current_setting('app.current_user_wallet') AND
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE wallet_address = current_setting('app.current_user_wallet')
    )
  );

-- FUNCTIONS AND TRIGGERS
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- REALTIME SUBSCRIPTIONS
-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
