"use client";

import { useState } from "react";

import { List, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DeleteConfirmDialog } from "@/components/shared/delete-dialog";

import {
  useDeleteListOption,
  useListOptions,
  useSaveListOption,
} from "@/features/settings/hooks/use-list-options";

interface ListOptionsManagerProps {
  type: "SOURCE" | "INDUSTRY";
  title: string;
}

export function ListOptionsManager({ type, title }: ListOptionsManagerProps) {
  const { data: options = [], isLoading } = useListOptions(type);
  const saveOption = useSaveListOption(type);
  const deleteOption = useDeleteListOption(type);

  const [editing, setEditing] = useState<{ id: string; value: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newValue, setNewValue] = useState("");

  if (isLoading) return null;

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <List className="h-5 w-5" />
          {title}
        </CardTitle>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setNewValue("");
            setIsDialogOpen(true);
          }}
        >
          <Plus className="ml-2 h-4 w-4" />
          افزودن گزینه
        </Button>
      </CardHeader>
      <CardContent>
        {options.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            هیچ گزینه‌ای ثبت نشده است
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">مقدار</TableHead>
                <TableHead className="w-24 text-start">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {options.map((opt) => (
                <TableRow key={opt.id}>
                  <TableCell className="font-medium">{opt.value}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditing(opt);
                          setNewValue(opt.value);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDeleting(opt.id)}
                      >
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "ویرایش گزینه" : "افزودن گزینه جدید"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>مقدار</Label>
              <Input
                placeholder={type === "SOURCE" ? "مثال: اینستاگرام" : "مثال: پلیمر"}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                saveOption.mutate(
                  editing ? { id: editing.id, value: newValue } : { value: newValue },
                  {
                    onSuccess: () => {
                      setIsDialogOpen(false);
                      setEditing(null);
                      setNewValue("");
                    },
                  }
                );
              }}
              disabled={!newValue.trim()}
            >
              {editing ? "بروزرسانی" : "افزودن"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteOption.mutate(deleting);
            setDeleting(null);
          }
        }}
        title="حذف گزینه"
        isPending={deleteOption.isPending}
      />
    </>
  );
}
