import React from 'react';

const Tabs = ({ tabs, activeTab, onSelect }) => {
  return (
    <nav className="tabs" aria-label="App sections">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          className={`tab-button ${activeTab === tab ? 'tab-button--active' : ''}`}
          onClick={() => onSelect(tab)}
          aria-pressed={activeTab === tab}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};

export default Tabs;