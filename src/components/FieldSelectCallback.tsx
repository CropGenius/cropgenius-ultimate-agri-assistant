import { FC } from 'react';

interface FieldSelectCallbackProps {
  onFieldSelect: (fieldId: string) => void;
  fields?: Array<{ id: string; name: string }>;
  className?: string;
}

const FieldSelectCallback: FC<FieldSelectCallbackProps> = ({
  onFieldSelect,
  fields = [],
  className = '',
}) => {
  const handleSelect = (fieldId: string) => {
    onFieldSelect(fieldId);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Select a Field</h3>

      {fields.length > 0 ? (
        <div className="space-y-2">
          {fields.map((field) => (
            <button
              key={field.id}
              onClick={() => handleSelect(field.id)}
              className="w-full text-left px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              data-testid={`field-${field.id}`}
            >
              {field.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-4">No fields available</p>
          <button
            onClick={() => handleSelect('new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            data-testid="create-field-button"
          >
            Create New Field
          </button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => handleSelect('new')}
          className="w-full flex justify-center items-center px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          data-testid="select-field-button"
        >
          <svg
            className="h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add New Field
        </button>
      </div>
    </div>
  );
};

export default FieldSelectCallback;
