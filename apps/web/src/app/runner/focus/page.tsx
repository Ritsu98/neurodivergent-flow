import { Suspense } from 'react';
import { FocusRunnerContent } from './FocusRunnerContent';

export default function FocusRunnerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-text-secondary">Loading...</p>
        </div>
      }
    >
      <FocusRunnerContent />
    </Suspense>
  );
}
