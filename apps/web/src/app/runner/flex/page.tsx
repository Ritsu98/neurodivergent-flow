import { Suspense } from 'react';
import { FlexRunnerContent } from './FlexRunnerContent';

export default function FlexRunnerPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <FlexRunnerContent />
    </Suspense>
  );
}
