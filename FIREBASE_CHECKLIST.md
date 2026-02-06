# Firebase Integration Checklist ✅

## Setup Steps (Do These First)

### 1. Create Firebase Project
- [ ] Go to https://console.firebase.google.com
- [ ] Click "Add project" or "Create a project"
- [ ] Name it: `cyber-breach` (or your choice)
- [ ] Disable Google Analytics (not needed)
- [ ] Click "Create project"

### 2. Enable Authentication
- [ ] Go to **Build** → **Authentication**
- [ ] Click "Get started"
- [ ] Click "Sign-in method" tab
- [ ] Enable **Email/Password**
- [ ] Enable **Google** (optional but recommended)

### 3. Enable Firestore Database
- [ ] Go to **Build** → **Firestore Database**
- [ ] Click "Create database"
- [ ] Choose "Start in test mode"
- [ ] Select location (us-central or closest to you)
- [ ] Click "Enable"

### 4. Set Security Rules
- [ ] In Firestore, click "Rules" tab
- [ ] Copy rules from `FIREBASE_SETUP.md` (Part 3, Step 6)
- [ ] Click "Publish"

### 5. Get Your Config
- [ ] Click ⚙️ (gear icon) → **Project settings**
- [ ] Scroll to "Your apps" section
- [ ] Click `</>` (web icon)
- [ ] Name it: `cyber-breach-web`
- [ ] Click "Register app"
- [ ] **COPY the firebaseConfig object**

### 6. Add Config to Your Code
- [ ] Open `auth.js` in your editor
- [ ] Find lines 4-10 (the firebaseConfig object)
- [ ] Replace with your actual config from Firebase
- [ ] Save the file

---

## Test Your Integration

### 7. Open the Game
- [ ] Open `index.html` in your browser
- [ ] You should see the login screen

### 8. Create Test Account
- [ ] Enter email: `test@example.com`
- [ ] Enter password: `test123456`
- [ ] Click "SIGN UP"
- [ ] Should see "User logged in" in console (F12)

### 9. Verify Cloud Sync
- [ ] Play a game and earn some XP
- [ ] Go to Firebase Console → Firestore Database
- [ ] You should see a `profiles` collection
- [ ] Click it to see your user data

### 10. Test Cross-Device Sync
- [ ] Open game in different browser/device
- [ ] Login with same email
- [ ] Your progress should load!

---

## Troubleshooting

### Login Screen Doesn't Appear
- [ ] Check browser console (F12) for errors
- [ ] Make sure all 3 Firebase scripts loaded
- [ ] Check if `auth.js` is loaded after Firebase scripts

### "Firebase not defined" Error
- [ ] Check internet connection
- [ ] Firebase CDN scripts must load first
- [ ] Try refreshing the page

### Can't Create Account
- [ ] Check if Email/Password is enabled in Firebase Console
- [ ] Password must be at least 6 characters
- [ ] Check browser console for specific error

### Data Not Syncing
- [ ] Check Firestore Rules are published
- [ ] Check browser console for permission errors
- [ ] Make sure you're logged in (check top-right corner)

### "Permission Denied" Error
- [ ] Go to Firestore → Rules
- [ ] Make sure rules allow authenticated users
- [ ] Click "Publish" after changing rules

---

## What You Should See

### ✅ Success Indicators:
1. Login modal appears on page load
2. Can create account or login
3. After login, see email in top-right corner
4. Terminal shows "CLOUD SYNC ENABLED"
5. Progress saves when you play
6. Data appears in Firestore Console
7. Can logout and login again with same progress

### ❌ Common Issues:
- **Blank page**: Check console for script errors
- **Login fails**: Check Firebase Auth is enabled
- **No sync**: Check Firestore Rules
- **"Guest mode"**: Firebase config not set correctly

---

## Files Modified

✅ `index.html` - Added Firebase scripts and auth UI  
✅ `auth.js` - Created (handles authentication)  
✅ `game.js` - Updated (calls cloud sync)  
✅ `styles.css` - Added auth styles  

---

## Next Steps After Setup

Once everything works:

1. **Secure Your Rules** (if going public)
   ```javascript
   // More restrictive rules
   match /profiles/{userId} {
     allow read: if request.auth.uid == userId;
     allow write: if request.auth.uid == userId 
                  && request.resource.data.keys().hasAll(['level', 'totalXP']);
   }
   ```

2. **Add Domain Restrictions**
   - Go to Project Settings
   - Add your domain to authorized domains

3. **Monitor Usage**
   - Check Firebase Console → Usage tab
   - Set up billing alerts (optional)

4. **Add Features**
   - Leaderboards
   - Friends system
   - Achievements
   - Profile pictures

---

## Need Help?

1. Check `FIREBASE_SETUP.md` for detailed instructions
2. Check browser console (F12) for errors
3. Check Firebase Console → Authentication → Users
4. Check Firebase Console → Firestore → Data

---

## Quick Reference

**Firebase Console**: https://console.firebase.google.com  
**Your Project**: https://console.firebase.google.com/project/YOUR_PROJECT_ID  
**Auth Users**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/authentication/users  
**Firestore Data**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/data  

---

**Ready to go? Follow the checklist above! 🚀**
