import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch items from backend
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      const data = await response.json();
      setItems(data);
      setError(null);
    } catch (err) {
      setError('Failed to load items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add new item
  const addItem = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: input.trim(),
          quantity: quantity || '1',
          checked: false,
        }),
      });
      const newItem = await response.json();
      setItems([...items, newItem]);
      setInput('');
      setQuantity('1');
      setError(null);
    } catch (err) {
      setError('Failed to add item');
      console.error(err);
    }
  };

  // Toggle item checked status
  const toggleItem = async (id) => {
    try {
      const item = items.find((i) => i.id === id);
      const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked: !item.checked }),
      });
      const updated = await response.json();
      setItems(items.map((i) => (i.id === id ? updated : i)));
      setError(null);
    } catch (err) {
      setError('Failed to update item');
      console.error(err);
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' });
      setItems(items.filter((i) => i.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete item');
      console.error(err);
    }
  };

  const uncheckedCount = items.filter((i) => !i.checked).length;
  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="app">
      <header className="header">
        <h1>Costco List</h1>
        <p className="subtitle">
          {uncheckedCount} to get • {checkedCount} done
        </p>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {!loading && (
        <main className="main">
          {/* Input Form */}
          <form onSubmit={addItem} className="form">
            <div className="form-row">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add item (e.g., Almond Butter)"
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
              <div className="empty-state">No items yet. Add one to get started!</div>
            ) : (
              <>
                {/* Active Items */}
                <div className="items-section">
                  {items
                    .filter((i) => !i.checked)
                    .map((item) => (
                      <div key={item.id} className="item unchecked">
                        <input
                          type="checkbox"
                          checked={false}
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

                {/* Checked Items */}
                {checkedCount > 0 && (
                  <div className="items-section checked-section">
                    <div className="section-divider">Done</div>
                    {items
                      .filter((i) => i.checked)
                      .map((item) => (
                        <div key={item.id} className="item checked">
                          <input
                            type="checkbox"
                            checked={true}
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
              </>
            )}
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
