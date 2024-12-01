export function Loader({ className }: { className?: string }) {
    return (
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-gray-900 ${className}`} />
    );
  }
  