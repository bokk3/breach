# Supabase Account System (Alternative)

## Why Supabase?

- Open source Firebase alternative
- PostgreSQL database (more powerful)
- Better for complex queries
- Generous free tier
- Built-in REST API

## Quick Setup

### 1. Install Supabase Client

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 2. Initialize

```javascript
const supabase = window.supabase.createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// Sign Up
async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password
  });
}

// Sign In
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });
}

// Save Profile
async function saveProfile(userId, profileData) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, ...profileData });
}

// Load Profile
async function loadProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}
```

### 3. Create Database Table

Run in Supabase SQL Editor:

```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  current_level_xp INTEGER DEFAULT 0,
  high_score INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  best_combo INTEGER DEFAULT 0,
  fastest_win INTEGER,
  total_nodes_hacked INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

## Pros vs Firebase

✅ SQL database (better for leaderboards)  
✅ Real-time subscriptions  
✅ Built-in REST API  
✅ Open source  
✅ Better pricing at scale  

## Cons vs Firebase

❌ Slightly more setup  
❌ Smaller community  
❌ Fewer integrations  
