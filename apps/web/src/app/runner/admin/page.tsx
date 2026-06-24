import { Suspense } from 'react';
import { AdminRunnerContent } from './AdminRunnerContent';

export default function AdminRunnerPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <AdminRunnerContent />
    </Suspense>
  );
}
