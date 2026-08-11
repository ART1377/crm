// src/app/tasks/page.tsx
import { TasksPage } from '@/features/tasks';
import { TasksSkeleton } from '@/features/tasks/components/skeleton';
import { Suspense } from 'react';

export default function Tasks() {
  return (
    <Suspense fallback={<TasksSkeleton />}>
      <TasksPage />
    </Suspense>
  );
}
