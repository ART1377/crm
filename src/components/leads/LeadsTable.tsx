import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreVertical, Trash2 } from "lucide-react";
import type { Lead } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  getSourceLabel,
  getStatusBadge,
} from "@/components/leads/lead-helpers";

interface LeadsTableProps {
  leads: Lead[];
  onDelete: (id: string) => void;
}

export function LeadsTable({ leads, onDelete }: LeadsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-start">نام کسب‌وکار</TableHead>
            <TableHead className="text-start">شخص تماس</TableHead>
            <TableHead className="text-start">شماره تماس</TableHead>
            <TableHead className="text-start">صنعت</TableHead>
            <TableHead className="text-start">منبع</TableHead>
            <TableHead className="text-start">وضعیت</TableHead>
            <TableHead className="text-start">تاریخ ثبت</TableHead>
            <TableHead className="text-start">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/leads/${lead.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {lead.businessName}
                </Link>
              </TableCell>
              <TableCell>{lead.contactPerson || "---"}</TableCell>
              <TableCell dir="ltr" className="text-left">
                {lead.phoneNumber}
              </TableCell>
              <TableCell>{lead.industry}</TableCell>
              <TableCell>{getSourceLabel(lead.source)}</TableCell>
              <TableCell>{getStatusBadge(lead.status)}</TableCell>
              <TableCell>{formatDate(new Date(lead.createdAt))}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/leads/${lead.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(lead.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
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
