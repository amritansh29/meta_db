import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import RawMongoQueryCard from './RawMongoQueryCard';
import SearchBar from './SearchBar';

function extractIdFromPath(pathname: string, key: string): string | undefined {
  const match = pathname.match(new RegExp(`/${key}/([^/]+)`));
  return match ? match[1] : undefined;
}

function getQueryDefaults(pathname: string) {
  // All-collection pages: set defaultCollection
  if (pathname === '/studies') {
    return { defaultCollection: 'studies' };
  }
  if (pathname === '/series') {
    return { defaultCollection: 'series' };
  }
  if (pathname === '/instances') {
    return { defaultCollection: 'instances' };
  }
  if (pathname === '/collections') {
    return { defaultCollection: 'collections' };
  }
  if (pathname === '/') {
    return {};
  }
  // /studies/:studyId/series
  if (/^\/studies\/[^/]+\/series$/.test(pathname)) {
    const studyId = extractIdFromPath(pathname, 'studies');
    if (studyId) return { defaultCollection: 'series', defaultQuery: { study_id: studyId } };
  }
  // /series/:seriesId/instances
  if (/^\/series\/[^/]+\/instances$/.test(pathname)) {
    const seriesId = extractIdFromPath(pathname, 'series');
    if (seriesId) return { defaultCollection: 'instances', defaultQuery: { series_id: seriesId } };
  }
  // /collections/:collectionId/studies
  if (/^\/collections\/[^/]+\/studies$/.test(pathname)) {
    const collectionId = extractIdFromPath(pathname, 'collections');
    if (collectionId) return { defaultCollection: 'studies', defaultQuery: { collection_ids: collectionId } };
  }
  // /studies/:studyId
  if (/^\/studies\/[^/]+$/.test(pathname)) {
    const studyId = extractIdFromPath(pathname, 'studies');
    if (studyId) return { defaultCollection: 'studies', defaultQuery: { _id: studyId } };
  }
  // /series/:seriesId
  if (/^\/series\/[^/]+$/.test(pathname)) {
    const seriesId = extractIdFromPath(pathname, 'series');
    if (seriesId) return { defaultCollection: 'series', defaultQuery: { _id: seriesId } };
  }
  // /instances/:instanceId
  if (/^\/instances\/[^/]+$/.test(pathname)) {
    const instanceId = extractIdFromPath(pathname, 'instances');
    if (instanceId) return { defaultCollection: 'instances', defaultQuery: { _id: instanceId } };
  }
  // /collections/:collectionId
  if (/^\/collections\/[^/]+$/.test(pathname)) {
    const collectionId = extractIdFromPath(pathname, 'collections');
    if (collectionId) return { defaultCollection: 'collections', defaultQuery: { _id: collectionId } };
  }
  return {};
}

const Header = () => {
  const location = useLocation();
  const [showRawQuery, setShowRawQuery] = useState(false);
  const [queryDefaults, setQueryDefaults] = useState<{ defaultCollection?: string; defaultQuery?: object }>({});
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getActiveClass = (path: string) => {
    return isActive(path) 
      ? 'bg-blue-700 text-white' 
      : 'text-gray-300 hover:bg-blue-600 hover:text-white';
  };

  const handleOpenRawQuery = () => {
    setQueryDefaults(getQueryDefaults(location.pathname));
    setShowRawQuery(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement search logic
    alert(`Search: ${searchValue}`);
    setShowSearchModal(false);
  };

  return (
    <header className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center text-white font-bold text-lg hover:text-blue-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              DICOM Dashboard
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-1 items-center">
            <Link
              to="/collections"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/collections')}`}
            >
              Collections
            </Link>
            <Link
              to="/studies"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/studies')}`}
            >
              Studies
            </Link>
            <Link
              to="/series"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/series')}`}
            >
              Series
            </Link>
            <Link
              to="/instances"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/instances')}`}
            >
              Instances
            </Link>
            {/* Raw Mongo Query Button - styled like other header links */}
            <button
              onClick={handleOpenRawQuery}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('RAW_MONGO_QUERY_MODAL')}`}
              type="button"
            >
              Raw Mongo Query
            </button>
            {/* Search Icon Button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="ml-2 p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Open search"
              type="button"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <RawMongoQueryCard open={showRawQuery} onClose={() => setShowRawQuery(false)} {...queryDefaults} />
          </nav>
        </div>
      </div>
      {/* Search Modal Overlay */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative pt-10">
            <button
              onClick={() => setShowSearchModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SearchBar
              value={searchValue}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
              placeholder="Search studies, series, or instances..."
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 