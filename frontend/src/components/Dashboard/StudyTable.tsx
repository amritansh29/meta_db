import { useQuery } from '@tanstack/react-query';
import { studiesApi } from '../../services/api';
import type { Study } from '../../types/dicom';
import { useState } from 'react';
import StudyRow from './StudyRow';
import DetailsModal from '../Common/DetailsModel';
import TableFilters from './TableFilters';

const modalities = ['CT', 'DX']; // Add as needed, dynamic fetching

const StudyTable = () => {
  const [filters, setFilters] = useState({
    modality: '',
    patientId: '',
    dateRange: ['', ''],
    description: ''
  });

  const { data: studies = [], isLoading, error } = useQuery({
    queryKey: ['studies', { limit: 10, filters }],
    queryFn: () => studiesApi.getStudies({ limit: 10, filters }),
  });

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

  const closeDetails = () => setDetailsOpen(false);

  const clearFilters = () => setFilters({ modality: '', patientId: '', dateRange: ['', ''], description: '' });

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
      <h1 className="text-2xl font-bold mb-6">DICOM Studies Dashboard</h1>
      <TableFilters
        filters={filters}
        onChange={setFilters}
        onClear={clearFilters}
        modalities={modalities}
      />
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold">Studies ({studies.length})</h2>
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