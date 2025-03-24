import React from 'react';

interface TableColumn<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    keyExtractor: (item: T) => string | number;
    className?: string;
}

function Table<T>({ data, columns, keyExtractor, className = '' }: TableProps<T>) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full border-collapse">
                <thead>
                <tr>
                    {columns.map((column, index) => (
                        <th
                            key={index}
                            className={`border border-gray-600 p-2 text-left ${column.className || ''}`}
                        >
                            {column.header}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((item) => (
                    <tr key={keyExtractor(item)}>
                        {columns.map((column, index) => (
                            <td
                                key={index}
                                className={`border border-gray-600 p-2 ${column.className || ''}`}
                            >
                                {typeof column.accessor === 'function'
                                    ? column.accessor(item)
                                    : item[column.accessor] as React.ReactNode}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Table;