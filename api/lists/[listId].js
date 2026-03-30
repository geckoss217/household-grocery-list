import fs from 'fs';
import path from 'path';

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

  const { listId } = req.query;

  try {
    if (req.method === 'DELETE') {
      const lists = readLists();
      const filtered = lists.filter((l) => l.id !== listId);

      if (filtered.length === lists.length) {
        res.status(404).json({ error: 'List not found' });
        return;
      }

      writeLists(filtered);
      res.status(204).end();
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
