import { useQuery } from '@tanstack/react-query';
import { instancesApi } from '../../../services/api';
import type { Instance } from '../../../types/dicom';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DetailsModal from '../../Common/DetailsModel';
import SortableHeader from '../../Common/SortableHeader';
import { useTableSort } from '../../../hooks/useTableSort';

const PAGE_SIZE = 20;

const AllInstancesTable = () => {
  const [page, setPage] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<Record<string, any> | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    instanceNumber: '',
    dateRange: ['', ''] as [string, string],
    sopClass: '',
  });

  // Sorting hook
  const { sortConfig, handleSort, getSortDirection, getMongoSort } = useTableSort();

  // Query for instances with pagination, filters, and sorting
  const { data: instancesData, isLoading, error, refetch } = useQuery({
    queryKey: ['all-instances', page, filters, { sort: sortConfig }],
    queryFn: () => instancesApi.getAllInstances({
      limit: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      filters,
      sort: getMongoSort(),
    }),
  });

  const instances = instancesData?.results || [];
  const total = instancesData?.total || 0;
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
      instanceNumber: '',
      dateRange: ['', ''],
      sopClass: '',
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
        <p className="mt-2">Loading instances...</p>
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
        <h1 className="text-2xl font-bold">All Instances</h1>
        <p className="text-gray-600 mt-1">Browse all DICOM instances in the database</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end mb-4">
        {/* Instance Number */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Instance Number</label>
          <input
            type="text"
            className="border rounded px-2 py-1"
            value={filters.instanceNumber}
            onChange={e => handleFilterChange({ ...filters, instanceNumber: e.target.value })}
            placeholder="Instance Number"
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
        {/* SOP Class */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">SOP Class</label>
          <input
            type="text"
            className="border rounded px-2 py-1"
            value={filters.sopClass}
            onChange={e => handleFilterChange({ ...filters, sopClass: e.target.value })}
            placeholder="SOP Class UID"
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
            Instances ({total}) - Page {page} of {totalPages || 1}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader
                  field="instance_number"
                  currentDirection={getSortDirection('instance_number')}
                  onSort={handleSort}
                >
                  Instance Number
                </SortableHeader>
                <SortableHeader
                  field="sop_instance_uid"
                  currentDirection={getSortDirection('sop_instance_uid')}
                  onSort={handleSort}
                >
                  SOP Instance UID
                </SortableHeader>
                <SortableHeader
                  field="sop_class_uid"
                  currentDirection={getSortDirection('sop_class_uid')}
                  onSort={handleSort}
                >
                  SOP Class UID
                </SortableHeader>
                <SortableHeader
                  field="acquisition_datetime"
                  currentDirection={getSortDirection('acquisition_datetime')}
                  onSort={handleSort}
                >
                  Acquisition Date/Time
                </SortableHeader>
                <SortableHeader
                  field="image_position"
                  currentDirection={getSortDirection('image_position')}
                  onSort={handleSort}
                >
                  Image Position
                </SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {instances.map((instance: Instance) => {
                if (!instance.id) return null;
                return (
                  <tr key={instance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {instance.instance_number || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={instance.sop_instance_uid}>
                        {instance.sop_instance_uid || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={instance.sop_class_uid || ''}>
                        {instance.sop_class_uid || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {instance.acquisition_datetime ? 
                        new Date(instance.acquisition_datetime).toLocaleString() : 
                        '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {instance.image_position || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className="text-blue-600 hover:underline text-xs"
                        onClick={() => openDetails('Instance Details', instance)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {instances.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No instances found matching the current filters
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
            Showing {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, total)} of {total} instances
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
        title="Instance Details"
        data={detailsData || {}}
      />
    </div>
  );
};

export default AllInstancesTable; 