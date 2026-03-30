import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dataFile = path.join(process.cwd(), 'data.json');

function ensureDataFile() {
  if (!fs.existsSync(dataFile)) {
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

function readLists() {
  try {
    ensureDataFile();
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

  try {
    if (req.method === 'GET') {
      const lists = readLists();
      res.status(200).json(lists);
    } else if (req.method === 'POST') {
      const { name } = req.body;
      if (!name || name.trim() === '') {
        res.status(400).json({ error: 'List name is required' });
        return;
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
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
