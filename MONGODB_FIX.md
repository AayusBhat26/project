# MongoDB Atlas & Vercel Deployment Fix

## 🔴 Critical Issues Found:
1. MongoDB connection timeout - Vercel cannot connect to MongoDB Atlas
2. Password contains special character `!` that needs URL encoding

## ✅ Required Fixes:

### Fix 1: Allow Vercel IP Access in MongoDB Atlas

1. Go to: https://cloud.mongodb.com/
2. Select your project
3. Click **"Network Access"** in left sidebar
4. Click **"ADD IP ADDRESS"**
5. Choose **"ALLOW ACCESS FROM ANYWHERE"**
   - IP Address: `0.0.0.0/0`
   - Comment: "Vercel Serverless Functions"
6. Click **"Confirm"**
7. Wait 2-3 minutes for changes to propagate

### Fix 2: Update DATABASE_URL in Vercel

Go to: https://vercel.com/aayusbhat26/project/settings/environment-variables

**Find `DATABASE_URL` and update it to:**

```
mongodb+srv://naayush448_db_user:Aayushbhat26%21@cluster0.l6ldcxg.mongodb.net/project?retryWrites=true&w=majority&tls=true
```

**Key changes:**
- `!` changed to `%21` (URL encoding)
- Added `&tls=true` for secure connection

### Fix 3: Redeploy on Vercel

After making both changes above:

1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. Click "..." menu → **"Redeploy"**
4. Wait for deployment to complete

## 🧪 Test After Fixes:

1. Visit: `https://project-ten-ebon.vercel.app`
2. Click "Sign in with Google"
3. Should work without errors!

## 📝 Alternative: Create New MongoDB User

If the above doesn't work, create a new MongoDB user without special characters:

1. MongoDB Atlas → Database Access
2. Add New Database User
3. Username: `vercel_user`
4. Password: `SimplePass123` (no special characters)
5. Update DATABASE_URL in Vercel:
   ```
   mongodb+srv://vercel_user:SimplePass123@cluster0.l6ldcxg.mongodb.net/project?retryWrites=true&w=majority&tls=true
   ```

## Common MongoDB Atlas Errors:

| Error | Solution |
|-------|----------|
| Server selection timeout | Allow 0.0.0.0/0 in Network Access |
| Authentication failed | Check username/password, URL encode special chars |
| InternalError | MongoDB cluster might be paused - check cluster status |
| SSL/TLS error | Add `&tls=true` to connection string |

---

**After applying these fixes, authentication should work perfectly!** 🎉
