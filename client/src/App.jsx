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

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('household-lists');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setLists(data);
        if (data.length > 0) {
          setCurrentListId(data[0].id);
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
    } else {
      const defaultList = {
        id: 'costco',
        name: 'Costco',
        items: [],
      };
      setLists([defaultList]);
      setCurrentListId(defaultList.id);
    }
    setLoading(false);
  }, []);

  // Save to localStorage when lists change
  useEffect(() => {
    if (!loading && lists.length > 0) {
      localStorage.setItem('household-lists', JSON.stringify(lists));
    }
  }, [lists, loading]);

  const currentList = lists.find((l) => l.id === currentListId);
  const items = currentList?.items || [];

  const handleAddItem = (e) => {
    e.preventDefault();
    
    if (!input.trim()) {
      console.warn('Input is empty');
      return;
    }

    if (!currentListId) {
      console.error('No current list selected');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name: input.trim(),
      quantity: quantity || '1',
      checked: false,
    };

    console.log('Adding item:', newItem);

    const updatedLists = lists.map((list) => {
      if (list.id === currentListId) {
        const updated = {
          ...list,
          items: [...(list.items || []), newItem],
        };
        console.log('Updated list:', updated);
        return updated;
      }
      return list;
    });

    console.log('Updated lists:', updatedLists);
    setLists(updatedLists);
    setInput('');
    setQuantity('1');
  };

  const handleToggleItem = (itemId) => {
    const updatedLists = lists.map((list) => {
      if (list.id === currentListId) {
        return {
          ...list,
          items: list.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      }
      return list;
    });
    setLists(updatedLists);
  };

  const handleDeleteItem = (itemId) => {
    const updatedLists = lists.map((list) => {
      if (list.id === currentListId) {
        return {
          ...list,
          items: list.items.filter((item) => item.id !== itemId),
        };
      }
      return list;
    });
    setLists(updatedLists);
  };

  const handleCreateList = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const newList = {
      id: Math.random().toString(36).substr(2, 9),
      name: newListName,
      items: [],
    };

    setLists([...lists, newList]);
    setCurrentListId(newList.id);
    setNewListName('');
  };

  const handleDeleteList = (listId) => {
    if (!window.confirm('Delete this list?')) return;

    const filtered = lists.filter((l) => l.id !== listId);
    setLists(filtered);
    if (filtered.length > 0) {
      setCurrentListId(filtered[0].id);
    }
  };

  const sortedItems = (() => {
    let sorted = [...items];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      sorted.sort((a, b) => {
        if (a.checked === b.checked) return 0;
        return a.checked ? 1 : -1;
      });
    }
    return sorted;
  })();

  const uncheckedCount = items.filter((i) => !i.checked).length;
  const checkedCount = items.filter((i) => i.checked).length;

  if (loading) {
    return <div className="app"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Household Lists</h1>
        <p className="subtitle">Organize your shopping and tasks</p>
      </header>

      <main className="main">
        <div className="list-manager">
          <div className="lists-tabs">
            {lists.map((list) => (
              <div key={list.id} className="list-tab-wrapper">
                <button
                  className={`list-tab ${currentListId === list.id ? 'active' : ''}`}
                  onClick={() => setCurrentListId(list.id)}
                >
                  {list.name}
                </button>
                {lists.length > 1 && (
                  <button
                    className="btn-delete-list"
                    onClick={() => handleDeleteList(list.id)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleCreateList} className="create-list-form">
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

        {currentList && (
          <>
            <div className="list-header">
              <h2>{currentList.name}</h2>
              <p className="list-stats">
                {uncheckedCount} to get • {checkedCount} done
              </p>
            </div>

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

            <form onSubmit={handleAddItem} className="form">
              <div className="form-row">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Add item..."
                  className="input"
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

            <div className="items-container">
              {items.length === 0 ? (
                <div className="empty-state">No items yet. Add one to get started!</div>
              ) : (
                <div className="items-section">
                  {sortedItems.map((item) => (
                    <div key={item.id} className={`item ${item.checked ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleToggleItem(item.id)}
                        className="checkbox"
                      />
                      <div className="item-content">
                        <span className="item-name">{item.name}</span>
                        {item.quantity && item.quantity !== '1' && (
                          <span className="item-qty">{item.quantity}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="btn-delete"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
