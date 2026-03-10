interface RankChangeProps {
  change: number | null;
  isNew?: boolean;
}

export default function RankChange({ change, isNew }: RankChangeProps) {
  if (isNew) {
    return (
      <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-400">
        NEW
      </span>
    );
  }

  if (change === null || change === 0) {
    return <span className="text-sm text-gray-500">-</span>;
  }

  if (change > 0) {
    return (
      <span className="flex items-center gap-0.5 text-sm font-medium text-green-400">
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        {change}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-0.5 text-sm font-medium text-red-400">
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
      {Math.abs(change)}
    </span>
  );
}
