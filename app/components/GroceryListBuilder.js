"use client";

import { useState, useRef, useEffect } from "react";

const COMMON_GROCERIES = [
  "Milk", "Bread", "Eggs", "Chicken", "Rice", "Pasta", "Cheese", "Yogurt",
  "Butter", "Apples", "Bananas", "Tomatoes", "Onions", "Potatoes", "Carrots",
  "Lettuce", "Cereal", "Oatmeal", "Juice", "Coffee", "Tea", "Flour", "Sugar",
  "Salt", "Olive oil", "Beans", "Tuna", "Ground beef", "Salmon", "Broccoli",
  "Spinach", "Garlic", "Peppers", "Cucumber", "Avocado", "Oranges", "Strawberries",
  "Frozen vegetables", "Ice cream", "Crackers", "Peanut butter", "Honey", "Vinegar",
];

function getNextId() {
  return String(Date.now()) + Math.random().toString(36).slice(2, 6);
}

export function GroceryListBuilder({ list, onListChange }) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  const filteredSuggestions = itemName.trim()
    ? COMMON_GROCERIES.filter((name) =>
        name.toLowerCase().includes(itemName.trim().toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function addItem(name = itemName.trim()) {
    const n = (name || itemName.trim()).trim();
    if (!n) return;
    const qty = Math.max(1, Math.min(999, Number(quantity) || 1));
    onListChange([
      ...list,
      { id: getNextId(), name: n.charAt(0).toUpperCase() + n.slice(1).toLowerCase(), quantity: qty },
    ]);
    setItemName("");
    setQuantity(1);
    setSuggestionsOpen(false);
    setHighlightedIndex(-1);
  }

  function removeItem(id) {
    onListChange(list.filter((item) => item.id !== id));
  }

  function updateQuantity(id, newQty) {
    const qty = Math.max(1, Math.min(999, Number(newQty) || 1));
    onListChange(
      list.map((item) =>
        item.id === id ? { ...item, quantity: qty } : item
      )
    );
  }

  function handleKeyDown(e) {
    if (!suggestionsOpen || filteredSuggestions.length === 0) {
      if (e.key === "Enter") addItem();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) =>
        i < filteredSuggestions.length - 1 ? i + 1 : 0
      );
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) =>
        i > 0 ? i - 1 : filteredSuggestions.length - 1
      );
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const name = filteredSuggestions[highlightedIndex] ?? filteredSuggestions[0];
      if (name) addItem(name);
      return;
    }
    if (e.key === "Escape") {
      setSuggestionsOpen(false);
      setHighlightedIndex(-1);
    }
  }

  return (
    <div className="grocery-builder">
      <div className="mb-4">
        <h1 className="hero-title mb-2">
          Your <span className="hero-highlight">grocery list</span>
        </h1>
        <p className="hero-subtitle mb-0">
          Add items and quantities. This list can be passed to the pricing engine.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="hero-card p-4">
            <h5 className="mb-3">Add item</h5>
            <div className="position-relative mb-3">
              <label htmlFor="grocery-item" className="form-label small text-muted">
                Item name
              </label>
              <input
                ref={inputRef}
                type="text"
                id="grocery-item"
                className="form-control form-control-lg"
                placeholder="e.g. Milk, Bread, Eggs"
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                  setSuggestionsOpen(true);
                  setHighlightedIndex(-1);
                }}
                onFocus={() => setSuggestionsOpen(true)}
                onKeyDown={handleKeyDown}
                list="grocery-suggestions"
                autoComplete="off"
              />
              <datalist id="grocery-suggestions">
                {COMMON_GROCERIES.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              {suggestionsOpen && filteredSuggestions.length > 0 && (
                <ul
                  ref={suggestionsRef}
                  className="list-group position-absolute w-100 mt-1 shadow-sm"
                  style={{ zIndex: 10, maxHeight: "220px", overflowY: "auto" }}
                >
                  {filteredSuggestions.map((name, i) => (
                    <li
                      key={name}
                      className={`list-group-item list-group-item-action ${
                        i === highlightedIndex ? "active" : ""
                      }`}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHighlightedIndex(i)}
                      onClick={() => addItem(name)}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="grocery-qty" className="form-label small text-muted">
                Quantity
              </label>
              <div className="d-flex align-items-center gap-2">
                <select
                  id="grocery-qty"
                  className="form-select form-select-lg"
                  style={{ width: "100px" }}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-primary btn-lg flex-grow-1"
                  style={{
                    backgroundColor: "var(--ss-primary)",
                    borderColor: "var(--ss-primary)",
                  }}
                  onClick={() => addItem()}
                >
                  Add to list
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="hero-card p-4">
            <h5 className="mb-3">Output (for pricing engine)</h5>
            <div
              className="border rounded-3 p-3 bg-light"
              style={{ minHeight: "120px" }}
            >
              {list.length === 0 ? (
                <p className="text-muted small mb-0">
                  Your list will appear here as: <code>Item x1</code>, <code>Item x2</code>, etc.
                </p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {list.map((item) => (
                    <li key={item.id} className="mb-1 font-monospace">
                      {item.name} x{item.quantity}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {list.length > 0 && (
        <div className="hero-card p-4 mt-4">
          <h5 className="mb-3">Your list</h5>
          <ul className="list-group list-group-flush">
            {list.map((item) => (
              <li
                key={item.id}
                className="list-group-item d-flex align-items-center justify-content-between px-0"
              >
                <div className="d-flex align-items-center gap-3 flex-grow-1">
                  <span className="fw-semibold">{item.name}</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: "70px" }}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, Number(e.target.value))
                    }
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
