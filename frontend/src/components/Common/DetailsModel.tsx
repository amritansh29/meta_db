import React from 'react';

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, any>;
}

const renderValue = (value: any) => {
  if (typeof value === 'object' && value !== null) {
    return (
      <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto max-h-40">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  return String(value);
};

const DetailsModal: React.FC<DetailsModalProps> = ({ open, onClose, title, data }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(data).map(([key, value]) => (
              <tr key={key} className="align-top border-b last:border-b-0">
                <td className="pr-4 py-1 font-mono text-gray-600">{key}</td>
                <td className="py-1">{renderValue(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetailsModal;
