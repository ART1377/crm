// src/features/tasks/components/table.tsx

'use client';

import Link from 'next/link';

import { ROUTES } from '@/routes/routes';
import { CheckCircle2, Circle, Clock, Contact, Phone, Trash2, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useUpdateTask } from '@/features/tasks/hooks/use-tasks';

import { useCopyToClipboard } from '@/hooks/use-copy';
import { downloadVCard, formatDate, isMobilePhone } from '@/lib/utils';

import { cn } from '@/lib/utils';

import { Task } from '../types/tasks-types';
import { getTaskDueInfo, getTaskStatusBadge } from '../utils/task-utils';

interface TasksTableProps {
  tasks: Task[];
  onDelete: (id: string) => void;
  selectedIds: string[];
  onSelectAll: () => void;
  onSelectOne: (id: string) => void;
}

export function TasksTable({
  tasks,
  onDelete,
  selectedIds,
  onSelectAll,
  onSelectOne,
}: TasksTableProps) {
  const updateTask = useUpdateTask();
  const { copy } = useCopyToClipboard();

  const handleToggleComplete = (task: Task) => {
    updateTask.mutate({
      taskId: task.id,
      data: { isCompleted: !task.isCompleted },
    });
  };

  const allSelected = tasks.length > 0 && selectedIds.length === tasks.length;

  const handleDownloadVCard = (task: Task) => {
    if (!task.lead) return;
    downloadVCard({
      businessName: task.lead.businessName,
      phoneNumber: task.lead.phoneNumber,
      contactPerson: task.lead.contactPerson,
      secondaryPhone: task.lead.secondaryPhone,
      industry: task.lead.industry,
      notes: task.lead.notes,
    });
  };

  const renderPhoneCell = (phone: string | null | undefined) => {
    if (!phone) return <span className="text-muted-foreground text-sm">---</span>;

    const isMobile = isMobilePhone(phone);

    return (
      <div className="flex items-center gap-1.5">
        <Phone
          className={cn('h-3.5 w-3.5', isMobile ? 'text-green-500' : 'text-muted-foreground')}
        />
        <a href={`tel:${phone}`} className="text-primary text-sm hover:underline" dir="ltr">
          {phone}
        </a>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox checked={allSelected} onCheckedChange={onSelectAll} />
            </TableHead>
            <TableHead className="min-w-40 text-start">عنوان</TableHead>
            <TableHead className="min-w-32 text-start">سرنخ</TableHead>
            <TableHead className="min-w-32 text-start">شخص تماس</TableHead>
            <TableHead className="min-w-32 text-start">شماره تماس</TableHead>
            <TableHead className="min-w-32 text-start">شماره دوم</TableHead>
            <TableHead className="min-w-32 text-start">تاریخ سررسید</TableHead>
            <TableHead className="min-w-24 text-start">وضعیت</TableHead>
            <TableHead className="min-w-48 text-start">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const { isOverdue, dueDate, dueText, dueColor } = getTaskDueInfo(task);
            const statusBadge = getTaskStatusBadge(task);

            return (
              <TableRow
                key={task.id}
                className={cn(
                  selectedIds.includes(task.id) && 'bg-primary/5',
                  task.isCompleted && 'opacity-50'
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(task.id)}
                    onCheckedChange={() => onSelectOne(task.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="cursor-pointer" onClick={() => handleToggleComplete(task)}>
                      {task.isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="text-muted-foreground h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        task.isCompleted && 'text-muted-foreground line-through'
                      )}
                    >
                      {task.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {task.lead && (
                    <Link
                      href={ROUTES.leads.detail(task.leadId)}
                      className="text-muted-foreground hover:text-primary flex items-center gap-1.5 text-sm hover:underline"
                    >
                      <User className="h-3.5 w-3.5" />
                      {task.lead.businessName}
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  {task.lead?.contactPerson ? (
                    <span className="text-sm">{task.lead.contactPerson}</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">---</span>
                  )}
                </TableCell>
                <TableCell>
                  {task.lead ? (
                    renderPhoneCell(task.lead.phoneNumber)
                  ) : (
                    <span className="text-muted-foreground text-sm">---</span>
                  )}
                </TableCell>
                <TableCell>
                  {task.lead?.secondaryPhone ? (
                    renderPhoneCell(task.lead.secondaryPhone)
                  ) : (
                    <span className="text-muted-foreground text-sm">---</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm" dir="ltr">
                      {formatDate(dueDate)}
                    </span>
                    <span className={cn('text-xs font-medium', dueColor)}>
                      {task.isCompleted ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          انجام شده
                        </span>
                      ) : isOverdue ? (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {dueText}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                          {dueText}
                        </span>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    {task.lead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          copy(task.lead!.phoneNumber, 'شماره کپی شد');
                          handleDownloadVCard(task);
                        }}
                        title="کپی شماره و ذخیره مخاطب"
                      >
                        <Contact className="h-4 w-4 text-blue-500" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground h-8 w-8 hover:text-red-500"
                      onClick={() => onDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
