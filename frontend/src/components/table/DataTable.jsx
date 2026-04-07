import React, { useState, useMemo } from 'react';
import { cn } from '../common/Button';

export function DataTable({ columns, data, isLoading, onRowClick, rowClassConfig, onSort }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const handleSort = (col) => {
    if (!col.sortable) return;

    let direction = 'asc';
    if (sortConfig.key === col.key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === col.key && sortConfig.direction === 'desc') {
      direction = null;
    }

    const nextSort = { key: direction ? col.key : null, direction };
    setSortConfig(nextSort);
    if (onSort) onSort(nextSort);
  };

  const displayData = useMemo(() => {
    if (onSort || !sortConfig.key || !sortConfig.direction) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key] || '';
      let bValue = b[sortConfig.key] || '';

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, onSort]);

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full line-clamp-3"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col)}
                className={cn(
                  "px-2 py-2 text-left text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider",
                  col.sortable && "cursor-pointer hover:bg-gray-100 transition-colors select-none",
                  col.nowrap && "whitespace-nowrap"
                )}
              >
                <div className="flex items-center space-x-1">
                  <span>{col.label}</span>
                  {col.sortable && (
                    <span className="flex flex-col text-[8px] leading-[4px] text-gray-400">
                      <span className={cn(sortConfig.key === col.key && sortConfig.direction === 'asc' ? "text-blue-600 font-bold" : "text-gray-300")}>▲</span>
                      <span className={cn(sortConfig.key === col.key && sortConfig.direction === 'desc' ? "text-blue-600 font-bold" : "text-gray-300")}>▼</span>
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-2 py-4 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            displayData.map((row, idx) => (
              <tr 
                key={row.l_id || row.dispatch_id || idx}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  "hover:bg-gray-50 transition-colors cursor-pointer",
                  rowClassConfig ? rowClassConfig(row) : ""
                )}
              >
                {columns.map((col) => (
                  <td 
                    key={col.key} 
                    className={cn(
                      "px-2 py-2 text-xs sm:text-sm text-gray-900 border-r last:border-0 border-gray-100",
                      col.truncate ? "max-w-[150px] sm:max-w-[200px] truncate" : "min-w-[50px]",
                      col.nowrap ? "whitespace-nowrap" : "break-words"
                    )}
                    title={col.truncate ? String(row[col.key] || '') : undefined}
                  >
                    {col.render ? col.render(row) : row[col.key] || '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
