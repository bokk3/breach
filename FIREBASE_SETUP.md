# Firebase Setup Guide - Step by Step

## Part 1: Create Firebase Account & Project (5 minutes)

### Step 1: Create Firebase Account
1. Go to https://console.firebase.google.com
2. Click **"Get Started"** or **"Go to Console"**
3. Sign in with your Google account (or create one)

### Step 2: Create New Project
1. Click **"Add project"** or **"Create a project"**
2. Enter project name: `cyber-breach` (or whatever you like)
3. Click **Continue**
4. **Google Analytics**: Toggle OFF (you don't need it for now)
5. Click **Create project**
6. Wait ~30 seconds for setup
7. Click **Continue**

---

## Part 2: Enable Authentication (2 minutes)

### Step 3: Enable Email/Password Auth
1. In left sidebar, click **"Build"** → **"Authentication"**
2. Click **"Get started"**
3. Click **"Sign-in method"** tab at top
4. Click **"Email/Password"** row
5. Toggle **"Enable"** to ON
6. Click **"Save"**

### Step 4: Enable Google Sign-In (Optional but Recommended)
1. Still in "Sign-in method" tab
2. Click **"Google"** row
3. Toggle **"Enable"** to ON
4. Select your support email from dropdown
5. Click **"Save"**

---

## Part 3: Enable Firestore Database (2 minutes)

### Step 5: Create Firestore Database
1. In left sidebar, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll secure it later)
4. Click **"Next"**
5. Choose location: **"us-central"** (or closest to you)
6. Click **"Enable"**
7. Wait ~30 seconds

### Step 6: Set Security Rules (Important!)
1. Click **"Rules"** tab at top
2. Replace the rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read leaderboards (for future feature)
    match /leaderboards/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

---

## Part 4: Get Your API Keys (3 minutes)

### Step 7: Register Your Web App
1. In left sidebar, click **⚙️ (gear icon)** → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click the **`</>`** (web) icon
4. Enter app nickname: `cyber-breach-web`
5. **Don't** check "Firebase Hosting" (not needed)
6. Click **"Register app"**

### Step 8: Copy Your Config
You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "cyber-breach-xxxxx.firebaseapp.com",
  projectId: "cyber-breach-xxxxx",
  storageBucket: "cyber-breach-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**COPY THIS ENTIRE OBJECT** - you'll need it in the next step!

<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyA_WRu84_tAn4wV9le_ti46dOR1Jz5DaTI",
    authDomain: "breach-44080.firebaseapp.com",
    projectId: "breach-44080",
    storageBucket: "breach-44080.firebasestorage.app",
    messagingSenderId: "895773119610",
    appId: "1:895773119610:web:411ab8a2de87d21c4817c3"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script>

9. Click **"Continue to console"**

---

## Part 5: Security Note

### Your API Key is Public (This is Normal!)
- ✅ The `apiKey` in the config is **meant to be public**
- ✅ It's safe to commit to GitHub
- ✅ Security comes from Firestore Rules (Step 6)
- ✅ Firebase automatically restricts access based on your domain

### What Protects Your Data:
1. **Firestore Rules** - Only authenticated users can access their own data
2. **Authentication** - Users must log in
3. **Domain Restrictions** - You can limit which domains can use your API

### Optional: Restrict to Your Domain
1. Go to **⚙️ → Project settings**
2. Scroll to **"Your apps"** section
3. Click your web app
4. Under **"App Check"**, you can add domain restrictions later

---

## Part 6: Test Your Setup

### Quick Test in Firebase Console
1. Go to **Authentication** → **Users** tab
2. Click **"Add user"**
3. Enter test email: `test@example.com`
4. Enter password: `test123456`
5. Click **"Add user"**

If you see the user appear, you're all set! ✅

---

## What You Have Now

✅ Firebase project created  
✅ Email/Password authentication enabled  
✅ Google Sign-In enabled  
✅ Firestore database created  
✅ Security rules configured  
✅ API keys obtained  

---

## Next Step

Now I'll integrate Firebase into your game code!

Just paste your `firebaseConfig` object when I ask for it, and I'll add it to your project.

---

## Troubleshooting

### "Project already exists"
- Use a different project name or add numbers: `cyber-breach-2`

### "Can't enable authentication"
- Make sure you clicked "Get started" first
- Refresh the page and try again

### "Firestore won't create"
- Check your internet connection
- Try a different browser (Chrome works best)

### "Lost my API keys"
- Go to ⚙️ → Project settings → Scroll down → Your apps
- Click the `</>` icon to see your config again

---

## Cost Breakdown (Free Tier)

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| Authentication | 50k users/month | ~100 users | $0 |
| Firestore Reads | 50k/day | ~1k/day | $0 |
| Firestore Writes | 20k/day | ~500/day | $0 |
| Storage | 1 GB | ~1 MB | $0 |
| Bandwidth | 10 GB/month | ~100 MB | $0 |

**Total: $0/month** for small-medium games

You'd need **thousands of daily active users** before paying anything.

---

## Ready?

Once you have your `firebaseConfig` object, let me know and I'll integrate it into your game! 🚀
