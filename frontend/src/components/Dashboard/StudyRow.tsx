import { ChevronRight, ChevronDown } from 'lucide-react';
import type { Study, Series } from '../../types/dicom';
import SeriesRows from './SeriesRow';

interface StudyRowProps {
  study: Study;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onViewDetails: () => void;
  onViewSeriesDetails: (series: Series) => void;
}

const StudyRow = ({ study, isExpanded, onToggleExpand, onViewDetails, onViewSeriesDetails }: StudyRowProps) => {
  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-2 py-4">
          <button
            onClick={() => { console.log('Expand clicked', study.id); onToggleExpand(); }}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {study.patient_id || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {study.study_date || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {study.modality || 'N/A'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {study.series?.length || 0}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {study.study_description || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <button
            className="text-blue-600 hover:underline text-xs"
            onClick={onViewDetails}
          >
            View Details
          </button>
        </td>
      </tr>
      {isExpanded && study.id && (
        <SeriesRows
          studyId={study.id}
          onViewSeriesDetails={onViewSeriesDetails}
        />
      )}
    </>
  );
};

export default StudyRow;
