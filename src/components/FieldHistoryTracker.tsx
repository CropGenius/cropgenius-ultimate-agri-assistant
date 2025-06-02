import React from 'react';
import { Calendar, Clock, Droplet, Thermometer, Sun, Calendar as CalendarIcon, Activity } from 'lucide-react';

export type HistoryEvent = {
  id: string;
  date: string;
  action: string;
  type: 'planting' | 'harvest' | 'irrigation' | 'fertilization' | 'pest_control' | 'weather' | 'other';
  details?: Record<string, any>;
  userId?: string;
  userName?: string;
};

interface FieldHistoryTrackerProps {
  history: HistoryEvent[];
  className?: string;
  onEventClick?: (event: HistoryEvent) => void;
  showFullHistory?: boolean;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'planting':
      return <Calendar className="h-4 w-4 text-green-500" />;
    case 'harvest':
      return <Activity className="h-4 w-4 text-yellow-500" />;
    case 'irrigation':
      return <Droplet className="h-4 w-4 text-blue-500" />;
    case 'fertilization':
      return <Thermometer className="h-4 w-4 text-purple-500" />;
    case 'weather':
      return <Sun className="h-4 w-4 text-orange-500" />;
    default:
      return <CalendarIcon className="h-4 w-4 text-gray-400" />;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case 'planting':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'harvest':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'irrigation':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'fertilization':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'weather':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const FieldHistoryTracker: React.FC<FieldHistoryTrackerProps> = ({
  history = [],
  className = '',
  onEventClick,
  showFullHistory = true,
}) => {
  // Group events by date
  const groupedEvents = history.reduce<Record<string, HistoryEvent[]>>((acc, event) => {
    const date = new Date(event.date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedEvents).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Limit to last 5 dates if not showing full history
  const displayDates = showFullHistory ? sortedDates : sortedDates.slice(0, 5);

  if (history.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 text-center ${className}`}>
        <div className="text-gray-400">
          <CalendarIcon className="mx-auto h-10 w-10 mb-2" />
          <p>No history available</p>
          <p className="text-sm text-gray-500 mt-1">Activities will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`} data-testid="field-history-tracker">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Field Activity</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {displayDates.map((date) => (
          <div key={date} className="p-4" data-testid={`history-date-format("${date}")`}>
            <div className="flex items-center mb-3">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="px-3 text-sm font-medium text-gray-500 bg-white">
                {formatDate(date)}
              </span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
            
            <ul className="space-y-3">
              {groupedEvents[date]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((event) => (
                  <li 
                    key={event.id} 
                    className={`relative pl-6 pb-4 border-l-2 ${getEventColor(event.type)} border-l-current`}
                    data-testid={`history-event-${event.id}`}
                  >
                    <div 
                      className={`absolute left-0 w-3 h-3 rounded-full -translate-x-[9px] ${getEventColor(event.type).replace('bg-', 'bg-').split(' ')[0]}`}
                      style={{ top: '0.5rem' }}
                    ></div>
                    
                    <div 
                      className={`p-3 rounded-lg cursor-pointer hover:bg-opacity-70 transition-colors ${getEventColor(event.type)}`}
                      onClick={() => onEventClick?.(event)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <span className="mr-2">{getEventIcon(event.type)}</span>
                          <span className="font-medium">{event.action}</span>
                        </div>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(event.date)}
                        </span>
                      </div>
                      
                      {event.details && Object.keys(event.details).length > 0 && (
                        <div className="mt-2 text-sm space-y-1">
                          {Object.entries(event.details).map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="text-gray-500 capitalize">{key.replace('_', ' ')}:</span>
                              <span className="ml-1 font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {event.userName && (
                        <div className="mt-2 text-xs text-gray-500">
                          Added by: {event.userName}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      
      {!showFullHistory && sortedDates.length > 5 && (
        <div className="px-6 py-3 bg-gray-50 text-center border-t border-gray-200">
          <button 
            className="text-sm font-medium text-green-600 hover:text-green-800 focus:outline-none"
            onClick={() => {/* Implement view all functionality */}}
          >
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};

export default FieldHistoryTracker;
