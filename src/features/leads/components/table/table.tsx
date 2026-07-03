'use client';

import { useEffect, useRef } from 'react';

import Link from 'next/link';

import { ROUTES } from '@/routes/routes';
import { Eye, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { getSourceLabel } from '@/features/leads/lead-helpers';

import { formatDate } from '@/lib/utils';

import { LEAD_STATUSES } from '../../constants/leads-constants';
import { Lead } from '../../types/leads-types';
import { EditLeadDialog } from './edit-lead/dialog';

interface LeadsTableProps {
  leads: Lead[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  selectedIds: string[];
  onSelectAll: () => void;
  onSelectOne: (id: string) => void;
}

export function LeadsTable({
  leads,
  onDelete,
  onStatusChange,
  selectedIds,
  onSelectAll,
  onSelectOne,
}: LeadsTableProps) {
  const allSelected = leads.length > 0 && selectedIds.length === leads.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < leads.length;
  const checkboxRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      const input = checkboxRef.current.querySelector('input');
      if (input) input.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox ref={checkboxRef} checked={allSelected} onCheckedChange={onSelectAll} />
            </TableHead>
            <TableHead className="text-start">نام کسب‌وکار</TableHead>
            <TableHead className="text-start">شخص تماس</TableHead>
            <TableHead className="text-start">شماره اصلی</TableHead>
            <TableHead className="text-start">شماره دوم</TableHead>
            <TableHead className="text-start">صنعت</TableHead>
            <TableHead className="text-start">منبع</TableHead>
            <TableHead className="text-start">وضعیت</TableHead>
            <TableHead className="text-start">تاریخ ثبت</TableHead>
            <TableHead className="text-start">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className={selectedIds.includes(lead.id) ? 'bg-primary/5' : ''}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(lead.id)}
                  onCheckedChange={() => onSelectOne(lead.id)}
                />
              </TableCell>
              <TableCell className="font-medium">
                <Link
                  href={ROUTES.leads.detail(lead.id)}
                  className="hover:text-primary transition-colors"
                >
                  {lead.businessName}
                </Link>
              </TableCell>
              <TableCell>{lead.contactPerson || '---'}</TableCell>
              <TableCell>
                <a href={`tel:${lead.phoneNumber}`} className="text-primary block hover:underline">
                  {lead.phoneNumber}
                </a>
              </TableCell>
              <TableCell>
                {lead.secondaryPhone ? (
                  <a
                    href={`tel:${lead.secondaryPhone}`}
                    className="text-primary block hover:underline"
                  >
                    {lead.secondaryPhone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">---</span>
                )}
              </TableCell>
              <TableCell>{lead.industry}</TableCell>
              <TableCell>{getSourceLabel(lead.source)}</TableCell>
              <TableCell>
                <Select value={lead.status} onValueChange={(v) => onStatusChange(lead.id, v)}>
                  <SelectTrigger className="h-8 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{formatDate(new Date(lead.createdAt))}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Link href={ROUTES.leads.detail(lead.id)}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <EditLeadDialog lead={lead} key={`${lead.id}-${lead.status}-${lead.updatedAt}`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </EditLeadDialog>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(lead.id)}>
                    <Trash2 className="text-destructive h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
