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
    fs.writeFileSync(dataFile, JSON.stringify([]));
  }
}

// Read items
function readItems() {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data) || [];
  } catch (err) {
    console.error('Error reading items:', err);
    return [];
  }
}

// Write items
function writeItems(items) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(items, null, 2));
  } catch (err) {
    console.error('Error writing items:', err);
  }
}

// GET /api/items - Get all items
app.get('/api/items', (req, res) => {
  const items = readItems();
  res.json(items);
});

// POST /api/items - Add new item
app.post('/api/items', (req, res) => {
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

  const items = readItems();
  items.push(newItem);
  writeItems(items);

  res.status(201).json(newItem);
});

// PUT /api/items/:id - Update item
app.put('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const { name, quantity, checked } = req.body;

  const items = readItems();
  const itemIndex = items.findIndex((i) => i.id === id);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (name !== undefined) items[itemIndex].name = name;
  if (quantity !== undefined) items[itemIndex].quantity = quantity;
  if (checked !== undefined) items[itemIndex].checked = checked;

  writeItems(items);
  res.json(items[itemIndex]);
});

// DELETE /api/items/:id - Delete item
app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const items = readItems();
  const filtered = items.filter((i) => i.id !== id);

  if (filtered.length === items.length) {
    return res.status(404).json({ error: 'Item not found' });
  }

  writeItems(filtered);
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
