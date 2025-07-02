import { useQuery } from '@tanstack/react-query';
import { collectionsApi } from '../../../services/api';
import type { Collection } from '../../../types/dicom';
import { Link } from 'react-router-dom';
import SortableHeader from '../../Common/SortableHeader';
import { useTableSort } from '../../../hooks/useTableSort';

const CollectionsTable = () => {
  // Sorting hook
  const { sortConfig, handleSort, getSortDirection, getMongoSort } = useTableSort();

  const { data: collectionsData, isLoading, error } = useQuery({
    queryKey: ['collections', { sort: sortConfig }],
    queryFn: () => collectionsApi.getCollections({ sort: getMongoSort() }),
  });

  const collections = collectionsData?.results || [];

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2">Loading collections...</p>
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
        <h1 className="text-2xl font-bold">DICOM Collections</h1>
        <p className="text-gray-600 mt-1">Browse studies organized by collections</p>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold">Collections ({collections.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader
                  field="name"
                  currentDirection={getSortDirection('name')}
                  onSort={handleSort}
                >
                  Collection Name
                </SortableHeader>
                <SortableHeader
                  field="description"
                  currentDirection={getSortDirection('description')}
                  onSort={handleSort}
                >
                  Description
                </SortableHeader>
                <SortableHeader
                  field="cases"
                  currentDirection={getSortDirection('cases')}
                  onSort={handleSort}
                >
                  Study Count
                </SortableHeader>
                <SortableHeader
                  field="created_at"
                  currentDirection={getSortDirection('created_at')}
                  onSort={handleSort}
                >
                  Created
                </SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {collections.map((collection: Collection) => {
                if (!collection.id) return null;
                return (
                  <tr key={collection.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {collection.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {collection.description || 'No description'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {collection.cases?.length || 0} studies
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {collection.created_at ? new Date(collection.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/collections/${collection.id}/studies`}
                        className="text-green-600 hover:underline text-xs"
                      >
                        View Studies
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {collections.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No collections found
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsTable; 