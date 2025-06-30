import { useQuery } from '@tanstack/react-query';
import { tableApi } from '../../services/tableApi';
import type { Series } from '../../types/dicom';

interface SeriesRowsProps {
  studyId: string;
}

const SeriesRows = ({ studyId }: SeriesRowsProps) => {
  const { data: series = [], isLoading, error } = useQuery({
    queryKey: ['series', studyId],
    queryFn: () => tableApi.getStudySeries(studyId),
    enabled: !!studyId,
  });

  if (isLoading) {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-2 bg-gray-50 text-center text-sm text-gray-500">
          Loading series...
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-2 bg-red-50 text-center text-sm text-red-600">
          Error loading series
        </td>
      </tr>
    );
  }

  if (series.length === 0) {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-2 bg-gray-50 text-center text-sm text-gray-500">
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
      </tr>
      {series.map((s: Series) => (
        <tr key={s.id} className="bg-gray-50">
          <td></td>
          <td colSpan={2} className="pl-10 py-2 text-sm text-gray-700">
            Series {s.series_number ?? '-'}
          </td>
          <td className="text-xs">{s.instances?.length ?? '-'}</td>
          <td className="text-xs">{s.series_description || '-'}</td>
        </tr>
      ))}
    </>
  );
};

export default SeriesRows;
