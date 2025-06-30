import { useQuery } from '@tanstack/react-query';
import { collectionsApi } from '../../services/api';
import type { Study, Series, Collection } from '../../types/dicom';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import StudyRow from './StudyRow';
import DetailsModal from '../Common/DetailsModel';
import TableFilters from './TableFilters';

const modalities = ['CT', 'DX']; // Add as needed, dynamic fetching

const PAGE_SIZE = 20;

const CollectionStudies = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  
  const [filters, setFilters] = useState({
    modality: '',
    patientId: '',
    dateRange: ['', ''] as [string, string],
    description: ''
  });

  const [page, setPage] = useState(1);

  // Query for collection details
  const { data: collection } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: () => collectionsApi.getCollection(collectionId!),
    enabled: !!collectionId,
  });

  // Query for paginated studies in this collection
  const { data, isLoading, error } = useQuery({
    queryKey: ['collection-studies', collectionId, { page, filters }],
    queryFn: () =>
      collectionsApi.getCollectionStudies(collectionId!, {
        limit: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        filters,
      }),
    keepPreviousData: true,
    enabled: !!collectionId,
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

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2">Loading collection studies...</p>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {collection?.name || 'Collection'} Studies
          </h1>
          {collection?.description && (
            <p className="text-gray-600 mt-1">{collection.description}</p>
          )}
        </div>
        <Link
          to="/collections"
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          ← Back to Collections
        </Link>
      </div>
      
      <TableFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={clearFilters}
        modalities={modalities}
      />
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold">Studies ({total})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Study Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Series Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Study Description
                </th>
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
                  />
                );
              })}
            </tbody>
          </table>
        </div>
        {studies.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No studies found in this collection
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

export default CollectionStudies; 