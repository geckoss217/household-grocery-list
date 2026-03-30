import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [lists, setLists] = useState([]);
  const [currentListId, setCurrentListId] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [input, setInput] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [sortBy, setSortBy] = useState('unchecked'); // 'unchecked', 'name', 'name-desc'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all lists and select first one
  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lists');
      const data = await response.json();
      setLists(data);
      if (data.length > 0) {
        setCurrentListId(data[0].id);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load lists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentList = lists.find((l) => l.id === currentListId);
  const items = currentList?.items || [];

  // Create new list
  const createList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName.trim() }),
      });
      const newList = await response.json();
      setLists([...lists, newList]);
      setCurrentListId(newList.id);
      setNewListName('');
      setError(null);
    } catch (err) {
      setError('Failed to create list');
      console.error(err);
    }
  };

  // Delete list
  const deleteList = async (listId) => {
    if (!window.confirm('Delete this list? This cannot be undone.')) return;

    try {
      await fetch(`/api/lists/${listId}`, { method: 'DELETE' });
      const filtered = lists.filter((l) => l.id !== listId);
      setLists(filtered);
      if (filtered.length > 0) {
        setCurrentListId(filtered[0].id);
      } else {
        setCurrentListId(null);
      }
      setError(null);
    } catch (err) {
      setError('Failed to delete list');
      console.error(err);
    }
  };

  // Add new item to current list
  const addItem = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentListId) return;

    try {
      const response = await fetch(`/api/lists/${currentListId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: input.trim(),
          quantity: quantity || '1',
          checked: false,
        }),
      });
      const newItem = await response.json();
      setLists(
        lists.map((l) =>
          l.id === currentListId
            ? { ...l, items: [...l.items, newItem] }
            : l
        )
      );
      setInput('');
      setQuantity('1');
      setError(null);
    } catch (err) {
      setError('Failed to add item');
      console.error(err);
    }
  };

  // Toggle item checked status
  const toggleItem = async (itemId) => {
    try {
      const item = items.find((i) => i.id === itemId);
      const response = await fetch(
        `/api/lists/${currentListId}/items/${itemId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checked: !item.checked }),
        }
      );
      const updated = await response.json();
      setLists(
        lists.map((l) =>
          l.id === currentListId
            ? {
                ...l,
                items: l.items.map((i) => (i.id === itemId ? updated : i)),
              }
            : l
        )
      );
      setError(null);
    } catch (err) {
      setError('Failed to update item');
      console.error(err);
    }
  };

  // Delete item
  const deleteItem = async (itemId) => {
    try {
      await fetch(`/api/lists/${currentListId}/items/${itemId}`, {
        method: 'DELETE',
      });
      setLists(
        lists.map((l) =>
          l.id === currentListId
            ? { ...l, items: l.items.filter((i) => i.id !== itemId) }
            : l
        )
      );
      setError(null);
    } catch (err) {
      setError('Failed to delete item');
      console.error(err);
    }
  };

  // Sort items
  const sortedItems = (() => {
    let sorted = [...items];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'unchecked') {
      // Unchecked first, then checked
      sorted.sort((a, b) => {
        if (a.checked === b.checked) return 0;
        return a.checked ? 1 : -1;
      });
    }
    return sorted;
  })();

  const uncheckedCount = items.filter((i) => !i.checked).length;
  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="app">
      <header className="header">
        <h1>Household Lists</h1>
        <p className="subtitle">Organize your shopping and tasks</p>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {!loading && (
        <main className="main">
          {/* List Manager */}
          <div className="list-manager">
            <div className="lists-tabs">
              {lists.map((list) => (
                <div key={list.id} className="list-tab-wrapper">
                  <button
                    className={`list-tab ${
                      currentListId === list.id ? 'active' : ''
                    }`}
                    onClick={() => setCurrentListId(list.id)}
                  >
                    {list.name}
                  </button>
                  {lists.length > 1 && (
                    <button
                      className="btn-delete-list"
                      onClick={() => deleteList(list.id)}
                      title="Delete list"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Create New List */}
            <form onSubmit={createList} className="create-list-form">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="New list name..."
                className="input-small"
              />
              <button type="submit" className="btn-add-list">
                + List
              </button>
            </form>
          </div>

          {currentList ? (
            <>
              {/* Current List Header */}
              <div className="list-header">
                <h2>{currentList.name}</h2>
                <p className="list-stats">
                  {uncheckedCount} to get • {checkedCount} done
                </p>
              </div>

              {/* Sort Options */}
              <div className="sort-controls">
                <label>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="unchecked">Unchecked First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </select>
              </div>

              {/* Add Item Form */}
              <form onSubmit={addItem} className="form">
                <div className="form-row">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Add item..."
                    className="input"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Qty"
                    className="quantity-input"
                  />
                  <button type="submit" className="btn-add">
                    Add
                  </button>
                </div>
              </form>

              {/* Items List */}
              <div className="items-container">
                {items.length === 0 ? (
                  <div className="empty-state">
                    No items yet. Add one to get started!
                  </div>
                ) : (
                  <div className="items-section">
                    {sortedItems.map((item) => (
                      <div
                        key={item.id}
                        className={`item ${item.checked ? 'checked' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItem(item.id)}
                          className="checkbox"
                        />
                        <div className="item-content">
                          <span className="item-name">{item.name}</span>
                          {item.quantity && item.quantity !== '1' && (
                            <span className="item-qty">{item.quantity}</span>
                          )}
                        </div>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="btn-delete"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              No lists yet. Create one to get started!
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default App;
