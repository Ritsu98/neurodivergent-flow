import { Suspense } from 'react';
import { RechargeRunnerContent } from './RechargeRunnerContent';

export default function RechargeRunnerPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <RechargeRunnerContent />
    </Suspense>
  );
}
