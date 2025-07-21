import { useQuery } from '@tanstack/react-query';
import { studiesApi } from '../../../services/api';
import type { Study, Series } from '../../../types/dicom';
import { useState, useEffect } from 'react';
import StudyRow from '../StudyRow';
import DetailsModal from '../../Common/DetailsModel';
import TableFilters from '../TableFilters';
import SortableHeader from '../../Common/SortableHeader';
import { useTableSort } from '../../../hooks/useTableSort';
import ColumnSelector from '../../Common/ColumnSelector';
import { getAvailableFields, getAvailableMetadataFields } from '../../../services/api';
// import axios from 'axios'; // Remove axios

const modalities = ['CT', 'DX']; // Add as needed, dynamic fetching

const PAGE_SIZE = 20
const StudyTable = () => {
  const [filters, setFilters] = useState({
    modality: '',
    patientId: '',
    dateRange: ['', ''] as [string, string],
    description: ''
  });

  const [page, setPage] = useState(1);

  // Sorting hook
  const { sortConfig, handleSort, getSortDirection, getMongoSort } = useTableSort();

  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'patient_id',
    'study_date',
    'modality',
    'study_description',
  ]);

  // Use useQuery to fetch available fields
  const { data: availableFieldsData } = useQuery({
    queryKey: ['available-fields', 'studies'],
    queryFn: () => getAvailableFields('studies'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: metadataFieldsData } = useQuery({
    queryKey: ['available-metadata-fields', 'studies'],
    queryFn: () => getAvailableMetadataFields('studies'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const mergedFields = [
    ...(availableFieldsData || []),
    ...(metadataFieldsData || []),
  ];
  // Deduplicate
  const availableFields = Array.from(new Set(mergedFields));

  // Query for paginated studies with sorting
  const { data, isLoading, error } = useQuery({
    queryKey: ['studies', { page, filters, sort: sortConfig }],
    queryFn: () =>
      studiesApi.getStudies({
        limit: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        filters,
        sort: getMongoSort(),
      }),
    keepPreviousData: true,
  });

  const studies = data?.results || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Track expanded study IDs
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTitle, setDetailsTitle] = useState('');
  const [detailsData, setDetailsData] = useState<Record<string, any> | null>(null);

  const toggleExpand = (studyId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studyId)) {
        newSet.delete(studyId);
      } else {
        newSet.add(studyId);
      }
      return newSet;
    });
  };

  const openDetails = (title: string, data: Record<string, any>) => {
    setDetailsTitle(title);
    setDetailsData(data);
    setDetailsOpen(true);
  };

  const openSeriesDetails = (series: Series) => {
    setDetailsTitle('Series Details');
    setDetailsData(series);
    setDetailsOpen(true);
  };

  const closeDetails = () => setDetailsOpen(false);

  const clearFilters = () => {
    setFilters({ modality: '', patientId: '', dateRange: ['', ''] as [string, string], description: '' });
    setPage(1);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters({ ...newFilters, dateRange: newFilters.dateRange as [string, string] });
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
        <p className="mt-2">Loading studies...</p>
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
        <h1 className="text-2xl font-bold">All Studies</h1>
        <p className="text-gray-600 mt-1">Browse all DICOM studies across all collections</p>
      </div>
      <div className="mb-4 flex items-center gap-4">
        <TableFilters
          filters={filters}
          onChange={handleFilterChange}
          onClear={clearFilters}
          modalities={modalities}
        />
        <ColumnSelector
          availableFields={availableFields}
          selectedFields={selectedColumns}
          onChange={setSelectedColumns}
          buttonLabel={availableFields.length === 0 ? 'Loading...' : 'Select Columns'}
          disabled={availableFields.length === 0}
        />
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold">Studies ({total})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th></th>
                {selectedColumns.map((field) => (
                  <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {field.replace(/_/g, ' ')}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {studies.map((study: Study) => {
                if (!study.id) return null;
                const studyId = study.id;
                return (
                  <StudyRow
                    key={studyId}
                    study={study}
                    isExpanded={expandedRows.has(studyId)}
                    onToggleExpand={() => toggleExpand(studyId)}
                    onViewDetails={() => openDetails('Study Details', study)}
                    onViewSeriesDetails={openSeriesDetails}
                    selectedColumns={selectedColumns}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
        {studies.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No studies found
          </div>
        )}
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages || 1} ({total} studies)
        </span>
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
      <DetailsModal
        open={detailsOpen}
        onClose={closeDetails}
        title={detailsTitle}
        data={detailsData || {}}
      />
    </div>
  );
};

export default StudyTable;