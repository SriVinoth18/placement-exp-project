export default function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={`animate-spin rounded-full border-brand-500 border-t-transparent ${sizeClasses[size]}`}
      role="status"
      aria-label="Loading"
    />
  );
}
