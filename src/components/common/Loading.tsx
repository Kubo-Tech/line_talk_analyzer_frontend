export interface LoadingProps {
  overlay?: boolean;
  message?: string;
}

export default function Loading({ overlay = false, message = '読み込み中...' }: LoadingProps) {
  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative h-16 w-16">
        <div className="absolute top-0 left-0 h-full w-full rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        <div className="border-primary absolute top-0 left-0 h-full w-full animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
      {message && (
        <p className="text-center text-sm whitespace-pre-line text-gray-600 dark:text-gray-400">
          {message}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">{spinner}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8" role="status" aria-live="polite">
      {spinner}
    </div>
  );
}
