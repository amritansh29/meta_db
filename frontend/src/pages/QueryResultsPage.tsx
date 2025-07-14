import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function isArrayOfObjects(data: any): data is Record<string, any>[] {
  return Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0]);
}

const API_BASE_URL = 'http://localhost:8001';

async function fetchQueryResults({ collection, query, limit, skip }: { collection: string, query: any, limit: number, skip: number }) {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection, query, limit, skip }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

const QueryResultsPage: React.FC = () => {
  const location = useLocation();
  // Expecting state: { results, collection, query, limit }
  const { collection, query, limit: initialLimit } = (location.state || {}) as {
    results?: any;
    collection: string;
    query: any;
    limit: number;
  };

  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(initialLimit || 100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch results when page, limit, collection, or query changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetchQueryResults({
      collection,
      query: query || {},
      limit,
      skip: (page - 1) * limit,
    })
      .then(data => {
        if (!isMounted) return;
        setResults(data.results || []);
        setTotal(data.total || 0);
      })
      .catch(e => {
        if (!isMounted) return;
        setError(e.message || 'Failed to fetch results.');
        setResults([]);
        setTotal(0);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [collection, JSON.stringify(query), page, limit]);

  // Table logic
  let tableData: Record<string, any>[] | null = null;
  if (isArrayOfObjects(results)) {
    tableData = results;
  }
  let allKeys: string[] = [];
  if (tableData && tableData.length > 0) {
    const keySet = new Set<string>();
    tableData.forEach(row => Object.keys(row).forEach(k => keySet.add(k)));
    allKeys = Array.from(keySet);
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex items-center px-6 py-4 bg-white/80 shadow-md">
        <h2 className="text-2xl font-bold mr-8">Query Results</h2>
        <div className="text-gray-600 text-sm flex flex-wrap gap-x-6">
          <span><span className="font-semibold">Collection:</span> {collection || '-'}</span>
          <span><span className="font-semibold">Limit:</span> 
            <input
              type="number"
              min={1}
              max={1000}
              value={limit}
              onChange={e => { setPage(1); setLimit(Number(e.target.value)); }}
              className="w-16 border rounded px-1 py-0.5 ml-1 text-xs"
            />
          </span>
          <span><span className="font-semibold">Query:</span> <span className="font-mono">{query ? JSON.stringify(query) : '{}'}</span></span>
        </div>
      </div>
      <div className="flex-1 w-full overflow-auto p-0">
        <div className="w-full h-full">
          <div className="font-semibold px-6 pt-4">Results:</div>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : error ? (
            <div className="text-red-600 px-6 py-4">{error}</div>
          ) : tableData ? (
            tableData.length === 0 ? (
              <div className="text-gray-500 italic px-6">No results to display.</div>
            ) : (
              <>
                <div className="overflow-auto px-6 pb-6">
                  <table className="min-w-full border border-gray-300 bg-white text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        {allKeys.map(key => (
                          <th key={key} className="px-2 py-1 border-b border-gray-200 text-left font-semibold whitespace-nowrap">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, i) => (
                        <tr key={i} className="even:bg-gray-50">
                          {allKeys.map(key => (
                            <td key={key} className="px-2 py-1 border-b border-gray-100 whitespace-nowrap max-w-xs truncate" title={row[key] !== undefined ? String(row[key]) : ''}>
                              {row[key] !== undefined ? String(row[key]) : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-4 px-6 pb-6">
                  <button
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {totalPages || 1} ({total} results)
                  </span>
                  <button
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0}
                  >
                    Next
                  </button>
                </div>
              </>
            )
          ) : results ? (
            <pre className="bg-gray-100 w-full h-[calc(100vh-100px)] overflow-auto text-xs p-6 rounded-none">
              {JSON.stringify(results, null, 2)}
            </pre>
          ) : (
            <div className="text-gray-500 italic px-6">No results to display.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueryResultsPage; 