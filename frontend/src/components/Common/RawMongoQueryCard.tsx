import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studiesApi, seriesApi, instancesApi, collectionsApi } from '../../services/api';

const COLLECTIONS = [
  { label: 'Studies', value: 'studies' },
  { label: 'Series', value: 'series' },
  { label: 'Instances', value: 'instances' },
  { label: 'Collections', value: 'collections' },
];

interface RawMongoQueryCardProps {
  open: boolean;
  onClose: () => void;
  defaultCollection?: string;
  defaultQuery?: object;
}

const RawMongoQueryCard: React.FC<RawMongoQueryCardProps> = ({ open, onClose, defaultCollection, defaultQuery }) => {
  const [collection, setCollection] = useState(defaultCollection || 'studies');
  const [query, setQuery] = useState(defaultQuery ? JSON.stringify(defaultQuery, null, 2) : '{}');
  const [limit, setLimit] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Update state if defaults change (e.g., when modal is opened from a new context)
  useEffect(() => {
    if (open) {
      setCollection(defaultCollection || 'studies');
      setQuery(defaultQuery ? JSON.stringify(defaultQuery, null, 2) : '{}');
    }
  }, [open, defaultCollection, defaultQuery]);

  if (!open) return null;

  const handleRunQuery = async () => {
    setError(null);
    let parsedQuery: any = {};
    try {
      parsedQuery = query.trim() ? JSON.parse(query) : {};
    } catch (e) {
      setError('Invalid JSON in query.');
      return;
    }
    setLoading(true);
    try {
      let data;
      if (collection === 'studies') {
        data = await studiesApi.getStudies({ filters: parsedQuery, limit });
      } else if (collection === 'series') {
        data = await seriesApi.getAllSeries({ filters: parsedQuery, limit });
      } else if (collection === 'instances') {
        data = await instancesApi.getAllInstances({ filters: parsedQuery, limit });
      } else if (collection === 'collections') {
        data = await collectionsApi.getCollections({ limit });
      }
      navigate('/query-results', {
        state: {
          results: data,
          collection,
          query: parsedQuery,
          limit,
        },
      });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Query failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full relative animate-fadeIn">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Raw MongoDB Query</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Collection</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={collection}
            onChange={e => setCollection(e.target.value)}
          >
            {COLLECTIONS.map(col => (
              <option key={col.value} value={col.value}>{col.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Query (JSON)</label>
          <textarea
            className="w-full border rounded px-3 py-2 font-mono text-sm"
            rows={4}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="{ }"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Limit</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={limit}
            min={1}
            max={1000}
            onChange={e => setLimit(Number(e.target.value))}
          />
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleRunQuery}
          disabled={loading}
        >
          {loading ? 'Running...' : 'Run Query'}
        </button>
        {error && <div className="mt-4 text-red-600">{error}</div>}
      </div>
    </div>
  );
};

export default RawMongoQueryCard; 