import React, { useState, useCallback, useMemo } from 'react';
import { ArrowUp, ArrowDown, Download, Search, X, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';
import { CSVLink } from 'react-csv';

const DataDisplay: React.FC = () => {
    const { csvData, fileName, setCsvData, setFileName } = useData();
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Search and pagination for data table
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsToShow, setRowsToShow] = useState(10);

    const rowValues = [5, 10, 25, 50, 100]


    const handleDeleteFile = () => {
        setCsvData(null);
        setFileName(null);
    };


    const handleSort = useCallback((key: string) => {
        setSortConfig(prevSortConfig => {
            if (!prevSortConfig || prevSortConfig.key !== key) {
                return { key, direction: 'asc' };
            }
            return {
                key,
                direction: prevSortConfig.direction === 'asc' ? 'desc' : 'asc'
            };
        });
    }, []);

    const sortedData = useMemo(() => {
        if (!csvData) return [];

        const sortableItems = [...csvData.data];
        if (sortConfig) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue === bValue) return 0;

                // Handle numeric sorting
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                }

                // Handle string sorting
                const aString = String(aValue || '').toLowerCase();
                const bString = String(bValue || '').toLowerCase();

                return sortConfig.direction === 'asc'
                    ? aString.localeCompare(bString)
                    : bString.localeCompare(aString);
            });
        }
        return sortableItems;
    }, [csvData, sortConfig]);

    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return sortedData;

        const query = searchQuery.toLowerCase().trim();
        return sortedData.filter(row => {
            return Object.values(row).some(value => {
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(query);
            });
        });
    }, [sortedData, searchQuery]);


    // Pagination
    const totalPages = filteredData.length ? Math.ceil(filteredData.length / rowsToShow) : 0;
    const currentPageData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsToShow;
        return filteredData.slice(startIndex, startIndex + rowsToShow);
    }, [filteredData, currentPage, rowsToShow]);

    // Reset to first page when search changes, or when rowsToShow changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, rowsToShow]);

    if (!csvData) {
        return null;
    }

    return (
        <motion.div
            className="p-[4rem] xl:w-[90%] mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex justify-between items-center mb-4 h-full text-gray-800 dark:text-gray-200">
                <div>
                    <h2 className="text-xl font-semibold">
                        {fileName || 'CSV Data'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {csvData.data.length} rows · {csvData.meta.fields.length} columns
                    </p>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={handleDeleteFile}
                        className="btn btn-outline flex items-center text-sm text-error-500 hover:bg-error-50 dark:hover:bg-error-950"
                        title="Delete file"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </button>
                    <CSVLink
                        data={csvData.data}
                        filename={fileName || 'download.csv'}
                        className="btn btn-outline flex items-center text-sm"
                    >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                    </CSVLink>
                </div>
            </div>

            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search data..."
                    className="input pl-10 pr-10"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                    </button>
                )}
            </div>

            <div className="overflow-x-scroll rounded-lg border border-gray-200 dark:border-gray-700" style={{ scrollbarWidth: "auto", msOverflowStyle: "scrollbar" }}>
                <table className="data-table bg-white dark:bg-gray-800">
                    <thead>
                        <tr>
                            {csvData.meta.fields.map((field) => (
                                <th key={field} onClick={() => handleSort(field)} className="cursor-pointer text-gray-800 dark:text-gray-200">
                                    <div className="flex items-center">
                                        <span>{field}</span>
                                        {sortConfig?.key === field && (
                                            <span className="ml-1">
                                                {sortConfig.direction === 'asc' ? (
                                                    <ArrowUp className="h-3 w-3" />
                                                ) : (
                                                    <ArrowDown className="h-3 w-3" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentPageData.length > 0 ? (
                            currentPageData.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {csvData.meta.fields.map((field) => (
                                        <td key={`${rowIndex}-${field}`} className="text-gray-800 dark:text-gray-200">
                                            {row[field] !== null && row[field] !== undefined ? String(row[field]) : ''}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={csvData.meta.fields.length} className="text-center py-4 text-gray-500 dark:text-gray-200">
                                    {searchQuery ? 'No matching data found' : 'No data available'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div>
                    <div className="mt-4 mb-1 flex items-center justify-between">
                        <div className="flex space-x-1">
                            {rowValues.map((value, index) => (
                                <button
                                    key={index}
                                    value={value}
                                    onClick={(e) => setRowsToShow(Number(e.target.value))}
                                    disabled={rowsToShow === value}
                                    className={`px-4 py-2 rounded border ${rowsToShow === value
                                        ? 'bg-primary-500 text-white'
                                        : 'border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>

                        <div className="flex space-x-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 
                         text-gray-600 dark:text-gray-400 
                         disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Calculate which page numbers to show
                                let pageNum;
                                if (totalPages <= 5) {
                                    // If 5 or fewer pages, show all
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    // If near the start
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    // If near the end
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    // In the middle
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 rounded ${pageNum === currentPage
                                            ? 'bg-primary-500 text-white'
                                            : 'border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 
                         text-gray-600 dark:text-gray-400 
                         disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>

                    </div>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Showing {Math.min(filteredData.length, (currentPage - 1) * rowsToShow + 1)} to{' '}
                        {Math.min(currentPage * rowsToShow, filteredData.length)} of {filteredData.length} results
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default DataDisplay;