# Household Grocery List App

A simple, fast household grocery list app to replace Cozi for your Costco shopping.

## Features

- ✅ Add/remove/check items
- ✅ Track quantities
- ✅ Separate "To Get" and "Done" sections
- ✅ Works on mobile (responsive design)
- ✅ Fast and minimal

## Tech Stack

- **Frontend**: React 18
- **Backend**: Node.js + Express
- **Database**: Simple JSON file (stored on Vercel)
- **Hosting**: Vercel + GitHub

## Project Structure

```
grocery-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── App.css        # Styles
│   │   └── index.js       # React entry point
│   ├── public/
│   │   └── index.html
│   └── package.json
├── api/                    # Node.js backend
│   ├── index.js           # Express API
│   ├── data.json          # Items storage
│   └── package.json
├── vercel.json            # Vercel deployment config
├── .gitignore
└── README.md
```

## Local Development

### Prerequisites
- Node.js 16+ and npm

### Setup

1. **Clone the repo** (after you push to GitHub)
   ```bash
   git clone https://github.com/YOUR_USERNAME/household-grocery-list.git
   cd household-grocery-list
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ../api && npm install
   cd ..
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

   This runs:
   - React dev server on `http://localhost:3000`
   - API server on `http://localhost:3001`

4. **Open browser**
   ```
   http://localhost:3000
   ```

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
# Initialize git repo
git init
git add .
git commit -m "Initial commit: grocery list app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/household-grocery-list.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select "Import Git Repository"
4. Find and select `household-grocery-list`
5. Click "Import"
6. **Framework**: Select "React"
7. **Root Directory**: Leave as `.`
8. Click "Deploy"

Vercel will:
- Build the React app
- Set up the Node.js API
- Deploy everything
- Give you a live URL

### Step 3: Share with family

Once deployed, share the Vercel URL with your spouse. You both can add/check items in real-time.

## How to Use

1. **Add an item**: Type item name, optional quantity, click "Add"
2. **Check off items**: Click the checkbox when you get an item
3. **Delete items**: Click the ✕ button
4. Items automatically move to "Done" section when checked

## API Endpoints

- `GET /api/items` - Get all items
- `POST /api/items` - Add new item
- `PUT /api/items/:id` - Update item (check/uncheck, edit name/qty)
- `DELETE /api/items/:id` - Delete item

## Troubleshooting

### Items aren't syncing between devices
- Items sync when you refresh the page
- For real-time sync without refreshing, we'd need to add WebSockets (future upgrade)

### API not connecting
- Check that the backend is running (`npm run dev`)
- Make sure you're not getting CORS errors in browser console

### Vercel deployment fails
- Check the build logs in Vercel dashboard
- Ensure `client/build` is in `.gitignore`
- Make sure all dependencies are in `package.json`

## Future Upgrades

- Real-time sync (WebSockets)
- User authentication
- Multiple lists (Costco, Whole Foods, etc.)
- Calendar integration
- Mobile app

## License

MIT
