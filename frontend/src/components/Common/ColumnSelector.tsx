import React, { useState } from 'react';

interface ColumnSelectorProps {
  availableFields: string[];
  selectedFields: string[];
  onChange: (fields: string[]) => void;
  buttonLabel?: string;
  disabled?: boolean;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  availableFields,
  selectedFields,
  onChange,
  buttonLabel = 'Select Columns',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [tempSelection, setTempSelection] = useState<string[]>(selectedFields);

  const handleCheckboxChange = (field: string) => {
    setTempSelection((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const handleApply = () => {
    onChange(tempSelection);
    setOpen(false);
  };

  const handleOpen = () => {
    if (disabled) return;
    setTempSelection(selectedFields);
    setOpen(true);
  };

  return (
    <>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        onClick={handleOpen}
        type="button"
        disabled={disabled}
      >
        {buttonLabel}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <h2 className="text-lg font-semibold mb-4">Select Columns</h2>
            <div className="max-h-64 overflow-y-auto mb-4">
              {availableFields.map((field) => (
                <label key={field} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSelection.includes(field)}
                    onChange={() => handleCheckboxChange(field)}
                    className="mr-2"
                  />
                  <span className="text-gray-800">{field}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={() => setOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleApply}
                type="button"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ColumnSelector; 