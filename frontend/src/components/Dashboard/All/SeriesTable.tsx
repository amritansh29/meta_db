import { useQuery } from '@tanstack/react-query';
import { seriesApi } from '../../../services/api';
import type { Series } from '../../../types/dicom';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DetailsModal from '../../Common/DetailsModel';
import SortableHeader from '../../Common/SortableHeader';
import { useTableSort } from '../../../hooks/useTableSort';

const PAGE_SIZE = 20;

const SeriesTable = () => {
  const [page, setPage] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<Record<string, any> | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    seriesNumber: '',
    dateRange: ['', ''] as [string, string],
    description: '',
  });

  // Sorting hook
  const { sortConfig, handleSort, getSortDirection, getMongoSort } = useTableSort();

  // Query for series with pagination, filters, and sorting
  const { data: seriesData, isLoading, error, refetch } = useQuery({
    queryKey: ['series', page, filters, { sort: sortConfig }],
    queryFn: () => seriesApi.getAllSeries({
      limit: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      filters,
      sort: getMongoSort(),
    }),
  });

  const series = seriesData?.results || [];
  const total = seriesData?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const openDetails = (title: string, data: Record<string, any>) => {
    setDetailsData(data);
    setDetailsOpen(true);
  };

  const closeDetails = () => setDetailsOpen(false);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      seriesNumber: '',
      dateRange: ['', ''],
      description: '',
    });
    setPage(1);
  };

  // Reset page when sorting changes
  useEffect(() => {
    setPage(1);
  }, [sortConfig]);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2">Loading series...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Series</h1>
        <p className="text-gray-600 mt-1">Browse all series in the database</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end mb-4">
        {/* Series Number */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Series Number</label>
          <input
            type="text"
            className="border rounded px-2 py-1"
            value={filters.seriesNumber}
            onChange={e => handleFilterChange({ ...filters, seriesNumber: e.target.value })}
            placeholder="Series Number"
          />
        </div>
        {/* Date Range */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={filters.dateRange[0]}
            onChange={e => handleFilterChange({ ...filters, dateRange: [e.target.value, filters.dateRange[1]] })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={filters.dateRange[1]}
            onChange={e => handleFilterChange({ ...filters, dateRange: [filters.dateRange[0], e.target.value] })}
          />
        </div>
        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            className="border rounded px-2 py-1"
            value={filters.description}
            onChange={e => handleFilterChange({ ...filters, description: e.target.value })}
            placeholder="Series Description"
          />
        </div>
        {/* Clear Button */}
        <button
          className="ml-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
          onClick={handleClearFilters}
          type="button"
        >
          Clear Filters
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold">
            Series ({total}) - Page {page} of {totalPages || 1}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader
                  field="series_number"
                  currentDirection={getSortDirection('series_number')}
                  onSort={handleSort}
                >
                  Series Number
                </SortableHeader>
                <SortableHeader
                  field="series_description"
                  currentDirection={getSortDirection('series_description')}
                  onSort={handleSort}
                >
                  Series Description
                </SortableHeader>
                <SortableHeader
                  field="body_part_examined"
                  currentDirection={getSortDirection('body_part_examined')}
                  onSort={handleSort}
                >
                  Body Part
                </SortableHeader>
                <SortableHeader
                  field="series_date"
                  currentDirection={getSortDirection('series_date')}
                  onSort={handleSort}
                >
                  Series Date
                </SortableHeader>
                <SortableHeader
                  field="series_instance_uid"
                  currentDirection={getSortDirection('series_instance_uid')}
                  onSort={handleSort}
                >
                  Series Instance UID
                </SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {series.map((seriesItem: Series) => {
                if (!seriesItem.id) return null;
                return (
                  <tr key={seriesItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {seriesItem.series_number || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={seriesItem.series_description || ''}>
                        {seriesItem.series_description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {seriesItem.body_part_examined || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {seriesItem.series_date ? 
                        new Date(seriesItem.series_date).toLocaleDateString() : 
                        '-'
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={seriesItem.series_instance_uid || ''}>
                        {seriesItem.series_instance_uid || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:underline text-xs"
                          onClick={() => openDetails('Series Details', seriesItem)}
                        >
                          View Details
                        </button>
                        <Link
                          to={`/series/${seriesItem.id}/instances`}
                          className="text-green-600 hover:underline text-xs"
                        >
                          View Instances
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {series.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No series found matching the current filters
          </div>
        )}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Showing {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, total)} of {total} series
          </span>
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
      
      <DetailsModal
        open={detailsOpen}
        onClose={closeDetails}
        title="Series Details"
        data={detailsData || {}}
      />
    </div>
  );
};

export default SeriesTable; 