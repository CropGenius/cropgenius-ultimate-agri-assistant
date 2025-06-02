import React from 'react';

interface Field {
  id: string;
  name: string;
  area?: number;
  cropType?: string;
  lastUpdated?: string;
}

interface FieldDashboardProps {
  fields: Field[];
  onFieldSelect?: (fieldId: string) => void;
  className?: string;
}

const FieldDashboard: React.FC<FieldDashboardProps> = ({
  fields,
  onFieldSelect,
  className = '',
}) => {
  const handleFieldClick = (fieldId: string) => {
    if (onFieldSelect) {
      onFieldSelect(fieldId);
    }
  };

  return (
    <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Fields</h2>
      
      {fields.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No fields found. Add your first field to get started.</p>
          <button
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={() => handleFieldClick('new')}
          >
            Add Field
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <div
              key={field.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleFieldClick(field.id)}
              data-testid={`field-${field.id}`}
            >
              <h3 className="text-lg font-semibold text-gray-800">{field.name}</h3>
              {field.cropType && (
                <p className="text-sm text-gray-600 mt-1">Crop: {field.cropType}</p>
              )}
              {field.area && (
                <p className="text-sm text-gray-600">Area: {field.area} ha</p>
              )}
              {field.lastUpdated && (
                <p className="text-xs text-gray-400 mt-2">
                  Updated: {new Date(field.lastUpdated).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
          
          <div 
            className="border-2 border-dashed rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-gray-50"
            onClick={() => handleFieldClick('new')}
          >
            <span className="text-gray-400">+ Add New Field</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldDashboard;
