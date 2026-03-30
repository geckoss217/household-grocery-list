# Quick Start Guide

Get this running in 5 minutes locally, then deploy to Vercel.

## Option 1: Run Locally First (Recommended)

### 1. Install dependencies

```bash
# From the root directory
npm install

cd client
npm install
cd ..

cd api
npm install
cd ..
```

### 2. Start the dev servers

```bash
# From the root directory
npm run dev
```

You should see:
```
React app running on http://localhost:3000
API running on port 3001
```

### 3. Test it out

Open `http://localhost:3000` in your browser and:
- Add items: "Almond Butter", "Paper Towels", etc.
- Check off items
- Delete items
- Refresh the page—items persist!

---

## Option 2: Deploy to Vercel Right Now

### Prerequisites
- GitHub account (free)
- Vercel account (free, sign up with GitHub)

### Steps

1. **Create a GitHub repo**
   - Go to github.com/new
   - Name it `household-grocery-list`
   - Initialize with README (optional)
   - Create repo

2. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial: grocery list app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/household-grocery-list.git
   git push -u origin main
   ```

3. **Deploy to Vercel**
   - Go to vercel.com/new
   - Click "Import Git Repository"
   - Select your `household-grocery-list` repo
   - Click Import
   - Keep defaults, click Deploy

Done! You'll get a live URL in ~2 minutes.

---

## Testing Both Devices

Once deployed:

1. Share the Vercel URL with your spouse
2. Open it on two devices
3. Add an item on Device A
4. Refresh on Device B to see it

(For real-time sync without refresh, we'd add WebSockets later.)

---

## File Structure Reference

```
grocery-app/
├── client/              React frontend (UI)
├── api/                 Node.js backend (API)
├── vercel.json         Deployment config
└── README.md           Full documentation
```

---

## Next Steps

1. ✅ Get it running locally
2. ✅ Test adding/checking items
3. ✅ Deploy to Vercel
4. ✅ Share with spouse
5. 🎉 Use it!

If you hit any issues, check the README.md for troubleshooting.
