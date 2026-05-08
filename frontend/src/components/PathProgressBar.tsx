interface PathProgressBarProps {
  label: string;
  completed: number;
  total: number;
  percentage: number;
}

export default function PathProgressBar({ label, completed, total, percentage }: PathProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <svg className="w-4 h-4 text-manah-gold flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67z"/>
      </svg>
      <span className="text-sm font-bold text-manah-cream whitespace-nowrap">{label}</span>
      <div className="flex-1 bg-manah-deep h-2 rounded-full overflow-hidden">
        <div
          className="bg-manah-gold h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-bold text-manah-cream whitespace-nowrap">
        {completed}/{total}
      </span>
    </div>
  );
}
