# Household Grocery List App - Technical Documentation

## Project Overview
A simple household shopping list app (Cozi replacement) for 2-4 person households. Currently features a Costco shopping list with add/check/delete functionality and multi-list support.

**Live App:** https://household-grocery-list.vercel.app
**GitHub:** https://github.com/geckoss217/household-grocery-list

---

## Tech Stack

### Frontend
- **Framework:** React 18 (Create React App)
- **Language:** JavaScript/JSX
- **Styling:** CSS (custom, in `client/src/App.css`)
- **State Management:** React hooks (useState, useEffect)

### Backend & Database
- **Database:** Supabase (PostgreSQL)
- **Client Library:** @supabase/supabase-js
- **Authentication:** None (public read/write via RLS policies)
- **Real-time:** Supabase Postgres Changes subscriptions configured

### Deployment
- **Frontend Hosting:** Vercel (auto-deploys from GitHub)
- **GitHub:** geckoss217/household-grocery-list (main branch)
- **Build:** `cd client && npm install && npm run build`

---

## Project Structure

```
/home/claude/grocery-app/
├── client/
│   ├── src/
│   │   ├── App.jsx              (Main React component - 431 lines)
│   │   ├── App.css              (Styling)
│   │   ├── supabaseClient.js    (Supabase config & client init)
│   │   └── index.js
│   ├── public/index.html
│   ├── package.json
│   └── package-lock.json
├── vercel.json                  (Deploy config)
├── .gitignore
└── README.md
```

---

## Supabase Configuration

### Database Setup
Two tables in Supabase project: `iugfiriwfiyljqfxrkuy`

**lists table:**
```sql
CREATE TABLE lists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**items table:**
```sql
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT DEFAULT '1',
  checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS)
Both tables have RLS enabled with permissive policies:
- `CREATE POLICY "Enable all" ON lists FOR ALL USING (true) WITH CHECK (true)`
- `CREATE POLICY "Enable all" ON items FOR ALL USING (true) WITH CHECK (true)`

### Credentials
- **Project URL:** https://iugfiriwfiyljqfxrkuy.supabase.co
- **Public API Key (anon):** `sb_publishable_PMn_pWRBLB_61dlssQnsVQ_e8x1F2Td`
- **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2Zpcml3Zml5bGpxZnhya3V5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkyMDE3NCwiZXhwIjoyMDkwNDk2MTc0fQ.gFs8qHoQkCBzYmOnMGlAV-qu5dlfj66-cgNnCqg_xJE`

---

## App.jsx Architecture

### State Variables
```javascript
[lists, setLists]                // Array of list objects with items
[currentListId, setCurrentListId] // Active list ID
[newListName, setNewListName]     // Form input for new list
[input, setInput]                 // Form input for new item
[quantity, setQuantity]           // Item quantity (default '1')
[sortBy, setSortBy]               // Sort option: 'unchecked', 'name', 'name-desc'
[loading, setLoading]             // Loading state during init
[error, setError]                 // Error message display
```

### Data Flow
1. **Init (useEffect):** Loads lists + items from Supabase on mount
2. **Add Item:** Inserts to `items` table, updates local state
3. **Toggle Item:** Updates `checked` boolean in Supabase
4. **Delete Item:** Removes from `items` table
5. **Create List:** Inserts to `lists` table
6. **Real-time Sync:** Supabase subscriptions listen for changes (setup but not fully utilized)

### Key Functions
- `loadLists()` - Fetches all lists and their items from Supabase
- `handleAddItem(e)` - Form submission to add item
- `handleToggleItem(itemId)` - Check/uncheck item
- `handleDeleteItem(itemId)` - Remove item
- `handleCreateList(e)` - Create new shopping list
- `handleDeleteList(listId)` - Delete entire list
- `sortedItems` - Computed array with sorting logic

---

## UI Components

### Main Sections
1. **Header:** Title + subtitle
2. **List Tabs:** Clickable tabs for each list (with delete X button)
3. **New List Form:** Input + "Add List" button
4. **List Header:** Shows current list name + stats (unchecked/checked counts)
5. **Sort Controls:** Dropdown with 3 sort options
6. **Add Item Form:** Item name input + quantity + Add button
7. **Items List:** Checkboxes + item name/qty + delete button per item
8. **Empty State:** Message when list has no items

### CSS Classes
- `.app` - Main container
- `.header` - Page header
- `.list-tab` / `.list-tab.active` - Tab styling
- `.form` / `.form-row` - Form layouts
- `.item` / `.item.checked` - Item styling
- `.sort-select` - Sort dropdown
- `.btn-add`, `.btn-delete`, `.btn-delete-list` - Button styles
- `.empty-state` - Empty state message

---

## Adding Future Features

### Calendar Feature (Next Priority)
**Considerations:**
- Add new Supabase table: `events` (id, date, title, description, created_at)
- Add new React tab/view for calendar
- Month view component recommended
- Consider recurring events? (out of scope for MVP)

**Changes needed:**
1. Create `events` table in Supabase
2. Add new state: `[events, setEvents]`, `[currentView, setCurrentView]` (lists vs calendar)
3. Create new component: `Calendar.jsx`
4. Add fetch/CRUD functions for events
5. Update navigation to switch views

### Multi-user Login (Future)
**Current status:** No authentication - data is public
**If needed:**
1. Enable Supabase Auth (email/password or OAuth)
2. Update RLS policies to `auth.uid()`
3. Add `user_id` column to `lists` table
4. Implement login/signup flow in React
5. Add user context or state management

### Mobile App (Future)
**Current:** Web-responsive only
**If native needed:**
- React Native with Expo
- Share Supabase backend (same database)
- Reuse API logic from App.jsx

---

## Deployment & Git Workflow

### Deploy Process
1. Push to `main` branch: `git push origin main`
2. Vercel auto-deploys within 1-2 minutes
3. Check deployment status: Vercel dashboard or `Vercel:list_deployments`

### Key Files for Deployment
- `vercel.json` - Build command: `cd client && npm install && npm run build`
- `client/package.json` - Dependencies (including @supabase/supabase-js)
- `.gitignore` - Ignores node_modules, .env (keep API key in code for now - public key only)

### Environment Variables (if needed later)
Currently hardcoded in `supabaseClient.js`. For security, migrate to `.env.local`:
```
REACT_APP_SUPABASE_URL=https://iugfiriwfiyljqfxrkuy.supabase.co
REACT_APP_SUPABASE_KEY=sb_publishable_PMn_pWRBLB_61dlssQnsVQ_e8x1F2Td
```

---

## Known Limitations & Improvements

### Current
- ✅ Works with Supabase
- ✅ Items persist across devices
- ✅ Multiple lists supported
- ✅ Mobile responsive
- ❌ No user authentication (public data)
- ❌ Real-time subscriptions set up but not fully utilized
- ❌ No conflict resolution for simultaneous edits

### Future Improvements
1. **Add auth:** Supabase email/password sign-up
2. **Improve real-time:** Use Supabase subscriptions to auto-refresh instead of manual fetches
3. **Offline support:** Add local caching with IndexedDB
4. **Sharing:** Generate shareable list links
5. **Search:** Filter items by name

---

## Testing & Troubleshooting

### Test Supabase Connectivity
```bash
curl -X GET "https://iugfiriwfiyljqfxrkuy.supabase.co/rest/v1/lists" \
  -H "apikey: sb_publishable_PMn_pWRBLB_61dlssQnsVQ_e8x1F2Td"
```

### Common Issues
- **Items not saving:** Check Supabase table exists + RLS policies allow inserts
- **App blank:** Check browser console for errors (F12 → Console)
- **Slow loads:** Vercel cold starts can take 5-10s on first load

---

## Important Links
- **Vercel Project:** https://vercel.com/geckoss217-3432s-projects/household-grocery-list
- **Supabase Dashboard:** https://supabase.com/dashboard/project/iugfiriwfiyljqfxrkuy
- **GitHub Repo:** https://github.com/geckoss217/household-grocery-list
- **Live App:** https://household-grocery-list.vercel.app

---

## Contact & Credentials
- **GitHub User:** geckoss217
- **Vercel Account:** geckoss217-3432 (geckoss217@gmail.com)
- **Supabase Project ID:** iugfiriwfiyljqfxrkuy
