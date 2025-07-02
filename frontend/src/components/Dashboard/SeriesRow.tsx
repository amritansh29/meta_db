import { useQuery } from '@tanstack/react-query';
import { seriesApi } from '../../services/api';
import type { Series } from '../../types/dicom';
import { Link } from 'react-router-dom';

interface SeriesRowsProps {
  studyId: string;
  onViewSeriesDetails: (series: Series) => void;
}

const SeriesRows = ({ studyId, onViewSeriesDetails }: SeriesRowsProps) => {
  const { data: series = [], isLoading, error } = useQuery({
    queryKey: ['series', studyId],
    queryFn: () => seriesApi.getStudySeries(studyId),
    enabled: !!studyId,
  });

  if (isLoading) {
    return (
      <tr>
        <td colSpan={6} className="px-6 py-2 bg-gray-50 text-center text-sm text-gray-500">
          Loading series...
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td colSpan={6} className="px-6 py-2 bg-red-50 text-center text-sm text-red-600">
          Error loading series
        </td>
      </tr>
    );
  }

  if (series.length === 0) {
    return (
      <tr>
        <td colSpan={6} className="px-6 py-2 bg-gray-50 text-center text-sm text-gray-500">
          No series found
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className="bg-gray-100">
        <td></td>
        <td colSpan={2} className="pl-10 py-2 font-semibold text-xs text-gray-600">Series #</td>
        <td className="text-xs font-semibold text-gray-600">Instance Count</td>
        <td className="text-xs font-semibold text-gray-600">Description</td>
        <td className="text-xs font-semibold text-gray-600">Actions</td>
      </tr>
      {series.map((s: Series) => (
        <tr key={s.id} className="bg-gray-50">
          <td></td>
          <td colSpan={2} className="pl-10 py-2 text-sm text-gray-700">
            Series {s.series_number ?? '-'}
          </td>
          <td className="text-xs">{s.instances?.length ?? '-'}</td>
          <td className="text-xs">{s.series_description || '-'}</td>
          <td className="text-xs">
            <div className="flex gap-2">
              <button
                className="text-blue-600 hover:underline text-xs"
                onClick={() => onViewSeriesDetails(s)}
              >
                View Details
              </button>
              {s.id && (
                <Link
                  to={`/series/${s.id}/instances`}
                  className="text-green-600 hover:underline text-xs"
                >
                  View Instances
                </Link>
              )}
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default SeriesRows;
