import React from 'react';
import './SearchBar.css';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  id,
  className = '',
}) {
  return (
    <div className={`search-bar-wrapper ${className}`}>
      <input
        id={id}
        type="text"
        className="search-bar-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="search-bar-icon">🔍</span>
      {value && (
        <button
          className="search-bar-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
          id={id ? `${id}-clear` : undefined}
        >
          ✕
        </button>
      )}
    </div>
  );
}
