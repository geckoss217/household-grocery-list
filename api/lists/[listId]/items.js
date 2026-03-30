import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dataFile = path.join(process.cwd(), 'data.json');

function readLists() {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data) || [];
  } catch (err) {
    console.error('Error reading lists:', err);
    return [];
  }
}

function writeLists(lists) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(lists, null, 2));
  } catch (err) {
    console.error('Error writing lists:', err);
  }
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { listId, itemId } = req.query;

  try {
    if (req.method === 'POST') {
      // Add item to list
      const { name, quantity, checked } = req.body;

      if (!name || name.trim() === '') {
        res.status(400).json({ error: 'Item name is required' });
        return;
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
        res.status(404).json({ error: 'List not found' });
        return;
      }

      lists[listIndex].items.push(newItem);
      writeLists(lists);
      res.status(201).json(newItem);
    } else if (req.method === 'PUT') {
      // Update item
      const { name, quantity, checked } = req.body;

      const lists = readLists();
      const listIndex = lists.findIndex((l) => l.id === listId);

      if (listIndex === -1) {
        res.status(404).json({ error: 'List not found' });
        return;
      }

      const itemIndex = lists[listIndex].items.findIndex((i) => i.id === itemId);

      if (itemIndex === -1) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }

      if (name !== undefined) lists[listIndex].items[itemIndex].name = name;
      if (quantity !== undefined) lists[listIndex].items[itemIndex].quantity = quantity;
      if (checked !== undefined) lists[listIndex].items[itemIndex].checked = checked;

      writeLists(lists);
      res.json(lists[listIndex].items[itemIndex]);
    } else if (req.method === 'DELETE') {
      // Delete item
      const lists = readLists();
      const listIndex = lists.findIndex((l) => l.id === listId);

      if (listIndex === -1) {
        res.status(404).json({ error: 'List not found' });
        return;
      }

      const filtered = lists[listIndex].items.filter((i) => i.id !== itemId);

      if (filtered.length === lists[listIndex].items.length) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }

      lists[listIndex].items = filtered;
      writeLists(lists);
      res.status(204).end();
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
