import React from 'react';
import './StatusBadge.css';

export default function StatusBadge({ status, id }) {
  if (!status) return null;

  const normalized = status.toLowerCase().replace(/[\s_]+/g, '-');
  const label = status.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`status-badge status-${normalized}`} id={id}>
      <span className="status-badge-dot" />
      {label}
    </span>
  );
}
