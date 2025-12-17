import React from 'react';
import './Table.css';

interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T, idx: number) => React.ReactNode;
  className?: string;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  actions?: (row: T, idx: number) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

function Table<T extends { id?: string | number }>(props: TableProps<T>) {
  const { 
    columns, 
    data, 
    actions, 
    emptyMessage = 'No records found.', 
    className = '',
    striped = true,
    hoverable = true,
    size = 'md',
    loading = false
  } = props;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }[size];

  const tableClasses = [
    'table',
    sizeClasses,
    striped ? 'table-striped' : '',
    hoverable ? 'table-hover' : '',
    className
  ].filter(Boolean).join(' ');

  if (loading) {
    return (
      <div className="table">
        <div className="flex items-center justify-center p-8">
          <div className="spinner mr-3" />
          <span className="text-secondary">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={tableClasses}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th 
                key={col.key as string} 
                className={`${col.className || ''} ${col.align ? `text-${col.align}` : ''}`}
                style={col.width ? { width: col.width } : {}}
              >
                {col.label}
                {col.sortable && (
                  <span className="ml-2 text-muted cursor-pointer hover:text-primary">
                    ↕
                  </span>
                )}
              </th>
            ))}
            {actions && (
              <th className="text-center w-32">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length + (actions ? 1 : 0)} 
                className="text-center py-8 text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id ?? idx} className="transition-colors">
                {columns.map((col) => (
                  <td 
                    key={col.key as string} 
                    className={`${col.className || ''} ${col.align ? `text-${col.align}` : ''}`}
                  >
                    {col.render ? col.render(row, idx) : (row as any)[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {actions(row, idx)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
