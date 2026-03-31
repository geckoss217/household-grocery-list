import React, { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabaseClient';

function App() {
  const [lists, setLists] = useState([]);
  const [currentListId, setCurrentListId] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [input, setInput] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [sortBy, setSortBy] = useState('unchecked');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // First, try to load from Supabase
        const { data: listsData, error: listsError } = await supabase
          .from('lists')
          .select('*');

        if (listsError) {
          console.error('Lists error:', listsError);
          // Fall back to localStorage if Supabase fails
          loadFromLocalStorage();
          return;
        }

        if (listsData && listsData.length > 0) {
          // Fetch items for each list
          const listsWithItems = await Promise.all(
            listsData.map(async (list) => {
              const { data: itemsData } = await supabase
                .from('items')
                .select('*')
                .eq('list_id', list.id);
              return { ...list, items: itemsData || [] };
            })
          );
          setLists(listsWithItems);
          setCurrentListId(listsWithItems[0].id);
        } else {
          // No lists exist, create default one
          const defaultList = {
            id: 'costco',
            name: 'Costco',
            created_at: new Date().toISOString(),
          };
          
          const { error: insertError } = await supabase
            .from('lists')
            .insert([defaultList]);

          if (!insertError) {
            setLists([{ ...defaultList, items: [] }]);
            setCurrentListId(defaultList.id);
          }
        }

        // Set up real-time subscriptions
        const subscription = supabase
          .channel('lists')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'lists' }, (payload) => {
            console.log('List change:', payload);
            // Reload lists on change
            loadLists();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, (payload) => {
            console.log('Item change:', payload);
            // Reload items on change
            loadLists();
          })
          .subscribe();

        setLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        loadFromLocalStorage();
      }
    };

    initializeApp();
  }, []);

  const loadFromLocalStorage = () => {
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
  };

  const loadLists = async () => {
    try {
      const { data: listsData } = await supabase.from('lists').select('*');
      if (listsData) {
        const listsWithItems = await Promise.all(
          listsData.map(async (list) => {
            const { data: itemsData } = await supabase
              .from('items')
              .select('*')
              .eq('list_id', list.id);
            return { ...list, items: itemsData || [] };
          })
        );
        setLists(listsWithItems);
      }
    } catch (err) {
      console.error('Error loading lists:', err);
    }
  };

  const currentList = lists.find((l) => l.id === currentListId);
  const items = currentList?.items || [];

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentListId) return;

    const newItem = {
      id: Date.now().toString(),
      list_id: currentListId,
      name: input.trim(),
      quantity: quantity || '1',
      checked: false,
    };

    try {
      const { error: insertError } = await supabase
        .from('items')
        .insert([newItem]);

      if (insertError) {
        console.error('Insert error:', insertError);
        setError('Failed to add item');
        return;
      }

      // Update local state
      setLists(
        lists.map((list) =>
          list.id === currentListId
            ? { ...list, items: [...list.items, newItem] }
            : list
        )
      );
      setInput('');
      setQuantity('1');
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item');
    }
  };

  const handleToggleItem = async (itemId) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    try {
      const { error: updateError } = await supabase
        .from('items')
        .update({ checked: !item.checked })
        .eq('id', itemId);

      if (updateError) {
        console.error('Update error:', updateError);
        return;
      }

      setLists(
        lists.map((list) =>
          list.id === currentListId
            ? {
                ...list,
                items: list.items.map((i) =>
                  i.id === itemId ? { ...i, checked: !i.checked } : i
                ),
              }
            : list
        )
      );
    } catch (err) {
      console.error('Error toggling item:', err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return;
      }

      setLists(
        lists.map((list) =>
          list.id === currentListId
            ? { ...list, items: list.items.filter((i) => i.id !== itemId) }
            : list
        )
      );
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const newList = {
      id: Date.now().toString(),
      name: newListName.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      const { error: insertError } = await supabase
        .from('lists')
        .insert([newList]);

      if (insertError) {
        console.error('Insert error:', insertError);
        setError('Failed to create list');
        return;
      }

      setLists([...lists, { ...newList, items: [] }]);
      setCurrentListId(newList.id);
      setNewListName('');
    } catch (err) {
      console.error('Error creating list:', err);
      setError('Failed to create list');
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Delete this list?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('lists')
        .delete()
        .eq('id', listId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return;
      }

      const filtered = lists.filter((l) => l.id !== listId);
      setLists(filtered);
      if (filtered.length > 0) {
        setCurrentListId(filtered[0].id);
      }
    } catch (err) {
      console.error('Error deleting list:', err);
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

      {error && <div className="error-banner">{error}</div>}

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
