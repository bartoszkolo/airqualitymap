import { memo } from 'react';

interface LiveIndicatorProps {
  /**
   * Size variant for the indicator
   * - sm: 1.5 x 1.5 (default)
   * - md: 2 x 2
   */
  size?: 'sm' | 'md';
  /**
   * Optional label to show next to the indicator
   */
  label?: string;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

export const LiveIndicator = memo(function LiveIndicator({
  size = 'sm',
  label,
  className = '',
}: LiveIndicatorProps) {
  const sizeClasses = size === 'md' ? 'h-2 w-2' : 'h-1.5 w-1.5';

  return (
    <span className={`flex items-center gap-1.5 ${className}`}>
      <span className={`relative flex ${sizeClasses}`}>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 motion-reduce:hidden" />
        <span className={`relative inline-flex rounded-full ${sizeClasses} bg-green-500`} />
      </span>
      {label && <span className="text-xs font-medium">{label}</span>}
    </span>
  );
});
