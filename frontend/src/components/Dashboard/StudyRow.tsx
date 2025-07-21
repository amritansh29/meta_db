import { ChevronRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Study, Series } from '../../types/dicom';
import SeriesRows from './SeriesRow';

interface StudyRowProps {
  study: Study;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onViewDetails: () => void;
  onViewSeriesDetails: (series: Series) => void;
  selectedColumns: string[];
}

const StudyRow = ({ study, isExpanded, onToggleExpand, onViewDetails, onViewSeriesDetails, selectedColumns }: StudyRowProps) => {
  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-2 py-4">
          <button
            onClick={() => { onToggleExpand(); }}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </td>
        {selectedColumns.map((field) => {
          let value = study[field as keyof Study] ?? study.metadata?.[field] ?? '—';
          if (Array.isArray(value)) {
            value = value.length > 0 ? `${value.length} items` : '—';
          } else if (typeof value === 'object' && value !== null) {
            value = '[object]';
          }
          return (
            <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {value}
            </td>
          );
        })}
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <div className="flex gap-2">
            <button
              className="text-blue-600 hover:underline text-xs"
              onClick={onViewDetails}
            >
              View Details
            </button>
            <Link
              to={`/studies/${study.id}/series`}
              className="text-green-600 hover:underline text-xs"
            >
              View Series
            </Link>
          </div>
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
