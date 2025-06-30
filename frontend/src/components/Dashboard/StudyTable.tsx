import { useQuery } from '@tanstack/react-query';
import { studiesApi } from '../../services/api';
import type { Study } from '../../types/dicom';
import { useState } from 'react';
import StudyRow from './StudyRow';

const fetchStudies = async () => {
  return studiesApi.getStudies({ limit: 10 });
};

const StudyTable = () => {
  const { data: studies = [], isLoading, error } = useQuery({
    queryKey: ['studies', { limit: 10 }],
    queryFn: fetchStudies,
  });

  // Track expanded study IDs
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {studies.map((study: Study) => {
                const studyId = study.id;
                return (
                  <StudyRow
                    key={studyId}
                    study={study}
                    isExpanded={expandedRows.has(studyId)}
                    onToggleExpand={() => toggleExpand(studyId)}
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
    </div>
  );
};

export default StudyTable;