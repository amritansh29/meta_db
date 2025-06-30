import React from 'react';

interface TableFiltersProps {
  filters: {
    modality: string;
    patientId: string;
    dateRange: [string, string];
    description: string;
  };
  onChange: (filters: TableFiltersProps['filters']) => void;
  onClear: () => void;
  modalities: string[];
}

const TableFilters: React.FC<TableFiltersProps> = ({ filters, onChange, onClear, modalities }) => {
  const [localPatientId, setLocalPatientId] = React.useState(filters.patientId);
  const [localDescription, setLocalDescription] = React.useState(filters.description);

  React.useEffect(() => {
    setLocalPatientId(filters.patientId);
  }, [filters.patientId]);

  React.useEffect(() => {
    setLocalDescription(filters.description);
  }, [filters.description]);

  return (
    <div className="flex flex-wrap gap-4 items-end mb-4">
      {/* Modality Dropdown */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Modality</label>
        <select
          className="border rounded px-2 py-1"
          value={filters.modality}
          onChange={e => onChange({ ...filters, modality: e.target.value })}
        >
          <option value="">All</option>
          {modalities.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      {/* Date Range */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={filters.dateRange[0]}
          onChange={e => onChange({ ...filters, dateRange: [e.target.value, filters.dateRange[1]] })}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={filters.dateRange[1]}
          onChange={e => onChange({ ...filters, dateRange: [filters.dateRange[0], e.target.value] })}
        />
      </div>
      {/* Patient ID */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Patient ID</label>
        <input
          type="text"
          className="border rounded px-2 py-1"
          value={localPatientId}
          onChange={e => setLocalPatientId(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              onChange({ ...filters, patientId: localPatientId });
            }
          }}
          placeholder="Patient ID"
        />
      </div>
      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          className="border rounded px-2 py-1"
          value={localDescription}
          onChange={e => setLocalDescription(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              onChange({ ...filters, description: localDescription });
            }
          }}
          placeholder="Study Description"
        />
      </div>
      {/* Clear Button */}
      <button
        className="ml-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
        onClick={onClear}
        type="button"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default TableFilters;
