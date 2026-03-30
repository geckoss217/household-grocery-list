import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [lists, setLists] = useState([]);
  const [currentListId, setCurrentListId] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [input, setInput] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [sortBy, setSortBy] = useState('unchecked');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    loadLists();
  }, []);

  // Save to localStorage whenever lists change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('household-lists', JSON.stringify(lists));
    }
  }, [lists, loading]);

  const loadLists = () => {
    try {
      const saved = localStorage.getItem('household-lists');
      if (saved) {
        const data = JSON.parse(saved);
        setLists(data);
        if (data.length > 0) {
          setCurrentListId(data[0].id);
        }
      } else {
        // Create default Costco list
        const defaultList = {
          id: Date.now().toString(),
          name: 'Costco',
          items: [],
          createdAt: new Date().toISOString(),
        };
        setLists([defaultList]);
        setCurrentListId(defaultList.id);
      }
      setError(null);
      setLoading(false);
    } catch (err) {
      setError('Failed to load lists');
      console.error(err);
      setLoading(false);
    }
  };

  const currentList = lists.find((l) => l.id === currentListId);
  const items = currentList?.items || [];

  // Create new list
  const createList = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const newList = {
      id: Date.now().toString(),
      name: newListName.trim(),
      items: [],
      createdAt: new Date().toISOString(),
    };

    setLists([...lists, newList]);
    setCurrentListId(newList.id);
    setNewListName('');
  };

  // Delete list
  const deleteList = (listId) => {
    if (!window.confirm('Delete this list? This cannot be undone.')) return;

    const filtered = lists.filter((l) => l.id !== listId);
    setLists(filtered);
    if (filtered.length > 0) {
      setCurrentListId(filtered[0].id);
    } else {
      setCurrentListId(null);
    }
  };

  // Add new item to current list
  const addItem = (e) => {
    e.preventDefault();
    if (!input.trim() || !currentListId) return;

    const newItem = {
      id: Date.now().toString(),
      name: input.trim(),
      quantity: quantity || '1',
      checked: false,
      createdAt: new Date().toISOString(),
    };

    setLists(
      lists.map((l) =>
        l.id === currentListId
          ? { ...l, items: [...l.items, newItem] }
          : l
      )
    );
    setInput('');
    setQuantity('1');
  };

  // Toggle item checked status
  const toggleItem = (itemId) => {
    setLists(
      lists.map((l) =>
        l.id === currentListId
          ? {
              ...l,
              items: l.items.map((i) =>
                i.id === itemId ? { ...i, checked: !i.checked } : i
              ),
            }
          : l
      )
    );
  };

  // Delete item
  const deleteItem = (itemId) => {
    setLists(
      lists.map((l) =>
        l.id === currentListId
          ? { ...l, items: l.items.filter((i) => i.id !== itemId) }
          : l
      )
    );
  };

  // Sort items
  const sortedItems = (() => {
    let sorted = [...items];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'unchecked') {
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
