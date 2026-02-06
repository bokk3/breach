// Firebase Authentication & Cloud Sync
// Replace firebaseConfig below with your actual config from Firebase Console

const firebaseConfig = {
  apiKey: "AIzaSyA_WRu84_tAn4wV9le_ti46dOR1Jz5DaTI",
  authDomain: "breach-44080.firebaseapp.com",
  projectId: "breach-44080",
  storageBucket: "breach-44080.firebasestorage.app",
  messagingSenderId: "895773119610",
  appId: "1:895773119610:web:411ab8a2de87d21c4817c3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let syncEnabled = true;

// Auth State Observer
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    console.log('User logged in:', user.email);
    
    // Hide auth modal, show user info
    document.getElementById('authModal').classList.remove('show');
    document.getElementById('userInfo').style.display = 'flex';
    document.getElementById('userEmail').textContent = user.email;
    
    // Load profile from cloud
    await loadProfileFromCloud(user.uid);
    addLog('> CLOUD SYNC ENABLED', 'success');
  } else {
    currentUser = null;
    console.log('User logged out');
    
    // Show auth modal, hide user info
    document.getElementById('authModal').classList.add('show');
    document.getElementById('userInfo').style.display = 'none';
    
    // Load from localStorage as fallback
    profile.load();
    updateProfileUI();
  }
});

// Email/Password Login
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;
  
  if (!email || !password) {
    showAuthError('Please enter email and password');
    return;
  }
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
    clearAuthInputs();
  } catch (error) {
    showAuthError(getAuthErrorMessage(error.code));
  }
});

// Email/Password Sign Up
document.getElementById('signupBtn').addEventListener('click', async () => {
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;
  
  if (!email || !password) {
    showAuthError('Please enter email and password');
    return;
  }
  
  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters');
    return;
  }
  
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    clearAuthInputs();
  } catch (error) {
    showAuthError(getAuthErrorMessage(error.code));
  }
});

// Google Sign-In
document.getElementById('googleBtn').addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
  } catch (error) {
    if (error.code !== 'auth/popup-closed-by-user') {
      showAuthError(getAuthErrorMessage(error.code));
    }
  }
});

// Guest Mode (Skip Login)
document.getElementById('guestBtn').addEventListener('click', () => {
  document.getElementById('authModal').classList.remove('show');
  profile.load();
  updateProfileUI();
  addLog('> PLAYING AS GUEST - PROGRESS SAVED LOCALLY ONLY', 'warning');
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  if (confirm('Logout? Your progress is saved in the cloud.')) {
    await auth.signOut();
    addLog('> LOGGED OUT - SWITCHED TO LOCAL STORAGE', 'warning');
  }
});

// Load Profile from Cloud
async function loadProfileFromCloud(userId) {
  try {
    const doc = await db.collection('profiles').doc(userId).get();
    
    if (doc.exists) {
      const data = doc.data();
      
      // Merge cloud data with local data (take the higher values)
      const localProfile = JSON.parse(localStorage.getItem('cyberBreachProfile') || '{}');
      
      profile.level = Math.max(data.level || 1, localProfile.level || 1);
      profile.totalXP = Math.max(data.totalXP || 0, localProfile.totalXP || 0);
      profile.currentLevelXP = data.currentLevelXP || 0;
      profile.highScore = Math.max(data.highScore || 0, localProfile.highScore || 0);
      profile.totalGames = Math.max(data.totalGames || 0, localProfile.totalGames || 0);
      profile.gamesWon = Math.max(data.gamesWon || 0, localProfile.gamesWon || 0);
      profile.bestCombo = Math.max(data.bestCombo || 0, localProfile.bestCombo || 0);
      
      if (data.fastestWin && localProfile.fastestWin) {
        profile.fastestWin = Math.min(data.fastestWin, localProfile.fastestWin);
      } else {
        profile.fastestWin = data.fastestWin || localProfile.fastestWin || null;
      }
      
      profile.totalNodesHacked = Math.max(data.totalNodesHacked || 0, localProfile.totalNodesHacked || 0);
      
      // Save merged data back to cloud
      await saveProfileToCloud();
      
      console.log('Profile loaded from cloud');
    } else {
      // No cloud profile, upload local profile
      console.log('No cloud profile found, uploading local data');
      await saveProfileToCloud();
    }
    
    updateProfileUI();
  } catch (error) {
    console.error('Error loading profile from cloud:', error);
    showAuthError('Failed to load cloud data. Using local save.');
    profile.load();
    updateProfileUI();
  }
}

// Save Profile to Cloud
async function saveProfileToCloud() {
  if (!currentUser || !syncEnabled) return;
  
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
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      email: currentUser.email
    }, { merge: true });
    
    console.log('Profile saved to cloud');
  } catch (error) {
    console.error('Error saving profile to cloud:', error);
  }
}

// Helper Functions
function clearAuthInputs() {
  document.getElementById('emailInput').value = '';
  document.getElementById('passwordInput').value = '';
  document.getElementById('authError').style.display = 'none';
}

function showAuthError(message) {
  const errorEl = document.getElementById('authError');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  setTimeout(() => {
    errorEl.style.display = 'none';
  }, 5000);
}

function getAuthErrorMessage(code) {
  const messages = {
    'auth/email-already-in-use': 'Email already registered. Try logging in.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-blocked': 'Popup blocked. Please allow popups for this site.'
  };
  return messages[code] || 'Authentication error. Please try again.';
}

// Export for use in game.js
window.saveProfileToCloud = saveProfileToCloud;
window.isUserLoggedIn = () => currentUser !== null;
