import { LucideProps } from 'lucide-react';

interface MiniChartProps {
  type: string;
  data: number[];
  labels: string[];
}

export default function MiniChart({ type, data, labels }: MiniChartProps) {
  const maxValue = Math.max(...data);
  const heights = data.map((val) => (val / maxValue) * 100);

  const getChartColor = () => {
    switch (type) {
      case 'rainfall':
        return 'bg-blue-500';
      case 'temperature':
        return 'bg-red-500';
      case 'humidity':
        return 'bg-cyan-500';
      case 'price':
        return 'bg-green-500';
      case 'harvest':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-end h-16 gap-1 pt-2">
      {heights.map((height, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div
            className={`w-full rounded-t ${getChartColor()}`}
            style={{ height: `${height}%` }}
          ></div>
          <span className="text-[8px] mt-1 text-gray-500">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
