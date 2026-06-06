import React, { useState } from 'react';
import './Table.css';

export default function Table({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon = '📋',
  onRowClick,
  page,
  totalPages,
  onPageChange,
  id,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortKey, sortDir]);

  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="table-wrapper" id={id}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${col.sortable ? 'sortable' : ''} ${sortKey === col.key ? 'sort-active' : ''}`}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
                {col.sortable && (
                  <span className="sort-icon">
                    {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '▲'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            skeletonRows.map((_, i) => (
              <tr key={`skel-${i}`} className="table-skeleton-row">
                {columns.map((col) => (
                  <td key={col.key}>
                    <div
                      className="table-skeleton-cell"
                      style={{ width: `${60 + Math.random() * 40}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="table-empty">
                  <div className="table-empty-icon">{emptyIcon}</div>
                  <div className="table-empty-text">{emptyMessage}</div>
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className={onRowClick ? 'clickable' : ''}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                id={id ? `${id}-row-${row.id || rowIdx}` : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={col.primary ? 'primary-cell' : ''}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="table-pagination">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="table-pagination-controls">
            <button
              className="table-pagination-btn"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              id={id ? `${id}-prev-page` : undefined}
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={`table-pagination-btn ${page === pageNum ? 'active' : ''}`}
                  onClick={() => onPageChange(pageNum)}
                  id={id ? `${id}-page-${pageNum}` : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="table-pagination-btn"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              id={id ? `${id}-next-page` : undefined}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
