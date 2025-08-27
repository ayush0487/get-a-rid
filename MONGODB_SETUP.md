# MongoDB Atlas Setup Guide

## 🚨 Current Error: Connection Timeout

The error `Operation users.findOne() buffering timed out` means your MongoDB connection string is incorrect or MongoDB Atlas is not properly configured.

## 🔧 Step-by-Step Fix:

### Step 1: Get Your MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in with your account
3. Click on your cluster (it should be something like "Cluster0")
4. Click the **"Connect"** button
5. Choose **"Drivers"**
6. Select **"Node.js"** and version **"4.1 or later"**
7. Copy the connection string - it should look like:
   ```
   mongodb+srv://ayush0487negi0487:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 2: Update Your Connection String

Your connection string should be:
```
mongodb+srv://ayush0487negi0487:tlKe36k2v3p8oDWd@[CLUSTER-URL]/bla_bla_travel?retryWrites=true&w=majority
```

**Replace `[CLUSTER-URL]` with your actual cluster URL** (like `cluster0.abc123.mongodb.net`)

### Step 3: Set Environment Variable in Render

1. Go to your **Render Dashboard**
2. Find your service and click on it
3. Go to **"Environment"** tab
4. Add or update:
   - **Key**: `MONGODB_URI`
   - **Value**: Your complete connection string from Step 2

### Step 4: Check MongoDB Atlas Network Access

1. In MongoDB Atlas, go to **"Network Access"** (in left sidebar)
2. Make sure you have an entry for **`0.0.0.0/0`** (allows access from anywhere)
3. If not, click **"Add IP Address"** → **"Allow Access From Anywhere"** → **"Confirm"**

### Step 5: Verify Database User Permissions

1. In MongoDB Atlas, go to **"Database Access"** (in left sidebar)
2. Make sure your user `ayush0487negi0487` has **"Read and write to any database"** permission
3. If not, edit the user and grant proper permissions

## 🧪 Testing the Connection

You can test your MongoDB connection by running:
```bash
npm run test-mongo
```

This will attempt to connect to MongoDB and show you exactly what's wrong if it fails.

## 🚀 Deploy Again

After updating the environment variable in Render:
1. Go to your service dashboard
2. Click **"Manual Deploy"** → **"Deploy Latest Commit"**
3. Wait for deployment to complete

## 📋 Checklist

- [ ] Got correct connection string from MongoDB Atlas
- [ ] Added database name `/bla_bla_travel` to connection string  
- [ ] Set MONGODB_URI environment variable in Render
- [ ] Verified network access allows 0.0.0.0/0
- [ ] Verified user has read/write permissions
- [ ] Redeployed on Render

## 🆘 Still Having Issues?

Check the Render logs for the exact error message. The improved server now shows:
- Whether MONGODB_URI is set
- The masked connection string being used
- Specific connection error details

Common issues:
- **Wrong cluster URL**: Make sure you copied the full cluster URL from MongoDB Atlas
- **Incorrect password**: Double-check the password in the connection string
- **Network restrictions**: Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- **Missing database name**: Make sure `/bla_bla_travel` is in the connection string
