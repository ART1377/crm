// src/features/tasks/utils/task-utils.ts

import { Task } from '../types/tasks-types';

export function getTaskDueInfo(task: Task) {
  const isOverdue = !task.isCompleted && new Date(task.dueDate) < new Date();
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dueText = '';
  let dueColor = '';

  if (task.isCompleted) {
    dueText = '✓ انجام شده';
    dueColor = 'text-green-600';
  } else if (isOverdue) {
    const days = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    dueText = `${days} روز دیرکرد`;
    dueColor = 'text-red-600';
  } else {
    const diff = dueDate.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 0) dueText = 'امروز';
    else if (days === 1) dueText = 'فردا';
    else if (days <= 7) dueText = `${days} روز دیگر`;
    else dueText = `${days} روز باقی‌مانده`;
    dueColor = 'text-blue-600';
  }

  return { isOverdue, dueDate, dueText, dueColor };
}

export function getTaskStatusBadge(task: Task) {
  if (task.isCompleted) return { label: 'انجام شده', variant: 'secondary' as const };
  const isOverdue = new Date(task.dueDate) < new Date();
  if (isOverdue) return { label: 'دیرکرد', variant: 'destructive' as const };
  return { label: 'در انتظار', variant: 'default' as const };
}