# Firebase Account System Integration

## Setup (5 minutes)

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Create new project
3. Enable Authentication (Email/Password or Google Sign-In)
4. Enable Firestore Database

### 2. Add Firebase to Your Project

Add to `index.html` before closing `</body>`:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

<!-- Firebase Config -->
<script>
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  firebase.initializeApp(firebaseConfig);
</script>

<script src="auth.js"></script>
<script src="game.js"></script>
```

### 3. Create Auth UI

Add to `index.html` after title:

```html
<!-- Auth Container -->
<div class="auth-container" id="authContainer">
  <div class="auth-box">
    <h2 class="auth-title">AGENT LOGIN</h2>
    <input type="email" id="emailInput" placeholder="Email" class="auth-input">
    <input type="password" id="passwordInput" placeholder="Password" class="auth-input">
    <button id="loginBtn" class="auth-btn">LOGIN</button>
    <button id="signupBtn" class="auth-btn">SIGN UP</button>
    <button id="googleBtn" class="auth-btn google">GOOGLE SIGN-IN</button>
  </div>
</div>

<!-- User Info (shown when logged in) -->
<div class="user-info" id="userInfo" style="display: none;">
  <span id="userEmail"></span>
  <button id="logoutBtn" class="logout-btn">LOGOUT</button>
</div>
```

### 4. Create auth.js

```javascript
const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null;

// Auth State Observer
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('userInfo').style.display = 'flex';
    document.getElementById('userEmail').textContent = user.email;
    
    // Load profile from Firestore
    await loadProfileFromCloud(user.uid);
  } else {
    currentUser = null;
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('userInfo').style.display = 'none';
  }
});

// Login
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
});

// Sign Up
document.getElementById('signupBtn').addEventListener('click', async () => {
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  
  try {
    await auth.createUserWithEmailAndPassword(email, password);
  } catch (error) {
    alert('Sign up failed: ' + error.message);
  }
});

// Google Sign-In
document.getElementById('googleBtn').addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
  } catch (error) {
    alert('Google sign-in failed: ' + error.message);
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  auth.signOut();
});

// Load Profile from Cloud
async function loadProfileFromCloud(userId) {
  try {
    const doc = await db.collection('profiles').doc(userId).get();
    if (doc.exists) {
      const data = doc.data();
      profile.level = data.level || 1;
      profile.totalXP = data.totalXP || 0;
      profile.currentLevelXP = data.currentLevelXP || 0;
      profile.highScore = data.highScore || 0;
      profile.totalGames = data.totalGames || 0;
      profile.gamesWon = data.gamesWon || 0;
      profile.bestCombo = data.bestCombo || 0;
      profile.fastestWin = data.fastestWin || null;
      profile.totalNodesHacked = data.totalNodesHacked || 0;
      updateProfileUI();
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

// Save Profile to Cloud
async function saveProfileToCloud() {
  if (!currentUser) return;
  
  try {
    await db.collection('profiles').doc(currentUser.uid).set({
      level: profile.level,
      totalXP: profile.totalXP,
      currentLevelXP: profile.currentLevelXP,
      highScore: profile.highScore,
      totalGames: profile.totalGames,
      gamesWon: profile.gamesWon,
      bestCombo: profile.bestCombo,
      fastestWin: profile.fastestWin,
      totalNodesHacked: profile.totalNodesHacked,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving profile:', error);
  }
}
```

### 5. Update game.js

Modify the `PlayerProfile.save()` method:

```javascript
save() {
  // Save locally
  localStorage.setItem('cyberBreachProfile', JSON.stringify({
    level: this.level,
    totalXP: this.totalXP,
    currentLevelXP: this.currentLevelXP,
    highScore: this.highScore,
    totalGames: this.totalGames,
    gamesWon: this.gamesWon,
    bestCombo: this.bestCombo,
    fastestWin: this.fastestWin,
    totalNodesHacked: this.totalNodesHacked
  }));
  
  // Save to cloud if logged in
  if (typeof saveProfileToCloud === 'function') {
    saveProfileToCloud();
  }
}
```

### 6. Add Auth Styles to styles.css

```css
.auth-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.auth-box {
  background: rgba(0, 0, 0, 0.9);
  border: 3px solid var(--neon-cyan);
  box-shadow: 0 0 50px rgba(0, 255, 255, 0.6);
  padding: 40px;
  max-width: 400px;
  width: 90%;
  clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
}

.auth-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 2rem;
  text-align: center;
  margin-bottom: 30px;
  color: var(--neon-cyan);
  text-shadow: 0 0 20px var(--neon-cyan);
}

.auth-input {
  width: 100%;
  padding: 15px;
  margin-bottom: 15px;
  background: rgba(0, 255, 255, 0.1);
  border: 2px solid var(--neon-cyan);
  color: var(--neon-cyan);
  font-family: 'Share Tech Mono', monospace;
  font-size: 1rem;
}

.auth-input:focus {
  outline: none;
  box-shadow: 0 0 20px var(--neon-cyan);
}

.auth-btn {
  width: 100%;
  margin-bottom: 10px;
}

.auth-btn.google {
  border-color: var(--neon-magenta);
  color: var(--neon-magenta);
}

.user-info {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px 20px;
  border: 2px solid var(--neon-cyan);
  z-index: 100;
}

.logout-btn {
  padding: 8px 20px;
  font-size: 0.8rem;
}
```

## Features You Get

✅ Email/Password authentication  
✅ Google Sign-In  
✅ Cloud save sync  
✅ Cross-device progress  
✅ Automatic backup  
✅ User management  
✅ Password reset (built-in)  

## Cost

- **Free Tier**: 50,000 daily active users
- **Storage**: 1GB free
- **Bandwidth**: 10GB/month free

## Security

Firebase handles:
- Password hashing
- Token management
- HTTPS encryption
- GDPR compliance

## Next Steps

1. Add leaderboards (Firestore queries)
2. Add friends system
3. Add achievements
4. Add profile pictures (Firebase Storage)

---

**Total Setup Time: ~30 minutes**
