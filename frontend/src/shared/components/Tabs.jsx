import React from 'react';
import './Tabs.css';

export default function Tabs({ tabs, activeTab, onChange, id }) {
  return (
    <div className="tabs-container" id={id} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`tab-button ${activeTab === tab.value ? 'active' : ''}`}
          onClick={() => onChange(tab.value)}
          role="tab"
          aria-selected={activeTab === tab.value}
          id={id ? `${id}-${tab.value}` : undefined}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="tab-count">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
