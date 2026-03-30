const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Data file path
const dataFile = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

// Initialize data file
function initializeDataFile() {
  if (!fs.existsSync(dataFile)) {
    // Create a default list
    const defaultData = [
      {
        id: uuidv4(),
        name: 'Costco',
        items: [],
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(dataFile, JSON.stringify(defaultData, null, 2));
  }
}

// Read lists
function readLists() {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data) || [];
  } catch (err) {
    console.error('Error reading lists:', err);
    return [];
  }
}

// Write lists
function writeLists(lists) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(lists, null, 2));
  } catch (err) {
    console.error('Error writing lists:', err);
  }
}

// GET /api/lists - Get all lists
app.get('/api/lists', (req, res) => {
  const lists = readLists();
  res.json(lists);
});

// POST /api/lists - Create new list
app.post('/api/lists', (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'List name is required' });
  }

  const newList = {
    id: uuidv4(),
    name: name.trim(),
    items: [],
    createdAt: new Date().toISOString(),
  };

  const lists = readLists();
  lists.push(newList);
  writeLists(lists);

  res.status(201).json(newList);
});

// DELETE /api/lists/:listId - Delete list
app.delete('/api/lists/:listId', (req, res) => {
  const { listId } = req.params;
  const lists = readLists();
  const filtered = lists.filter((l) => l.id !== listId);

  if (filtered.length === lists.length) {
    return res.status(404).json({ error: 'List not found' });
  }

  writeLists(filtered);
  res.status(204).send();
});

// POST /api/lists/:listId/items - Add item to list
app.post('/api/lists/:listId/items', (req, res) => {
  const { listId } = req.params;
  const { name, quantity, checked } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Item name is required' });
  }

  const newItem = {
    id: uuidv4(),
    name: name.trim(),
    quantity: quantity || '1',
    checked: checked || false,
    createdAt: new Date().toISOString(),
  };

  const lists = readLists();
  const listIndex = lists.findIndex((l) => l.id === listId);

  if (listIndex === -1) {
    return res.status(404).json({ error: 'List not found' });
  }

  lists[listIndex].items.push(newItem);
  writeLists(lists);

  res.status(201).json(newItem);
});

// PUT /api/lists/:listId/items/:itemId - Update item
app.put('/api/lists/:listId/items/:itemId', (req, res) => {
  const { listId, itemId } = req.params;
  const { name, quantity, checked } = req.body;

  const lists = readLists();
  const listIndex = lists.findIndex((l) => l.id === listId);

  if (listIndex === -1) {
    return res.status(404).json({ error: 'List not found' });
  }

  const itemIndex = lists[listIndex].items.findIndex((i) => i.id === itemId);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (name !== undefined) lists[listIndex].items[itemIndex].name = name;
  if (quantity !== undefined) lists[listIndex].items[itemIndex].quantity = quantity;
  if (checked !== undefined) lists[listIndex].items[itemIndex].checked = checked;

  writeLists(lists);
  res.json(lists[listIndex].items[itemIndex]);
});

// DELETE /api/lists/:listId/items/:itemId - Delete item
app.delete('/api/lists/:listId/items/:itemId', (req, res) => {
  const { listId, itemId } = req.params;

  const lists = readLists();
  const listIndex = lists.findIndex((l) => l.id === listId);

  if (listIndex === -1) {
    return res.status(404).json({ error: 'List not found' });
  }

  const filtered = lists[listIndex].items.filter((i) => i.id !== itemId);

  if (filtered.length === lists[listIndex].items.length) {
    return res.status(404).json({ error: 'Item not found' });
  }

  lists[listIndex].items = filtered;
  writeLists(lists);
  res.status(204).send();
});

// Catch-all for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Initialize and start server
initializeDataFile();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

