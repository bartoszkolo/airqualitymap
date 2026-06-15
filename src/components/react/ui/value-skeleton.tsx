import { memo } from 'react';

interface ValueSkeletonProps {
  /**
   * Width of the skeleton (e.g., '3ch', '2rem', '100%')
   * @default '2.5ch'
   */
  width?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const ValueSkeleton = memo(function ValueSkeleton({
  width = '2.5ch',
  className = '',
}: ValueSkeletonProps) {
  return (
    <div
      className={`inline-block h-[1.375rem] rounded bg-muted animate-pulse ${className}`}
      style={{ width }}
      aria-hidden="true"
    />
  );
});
