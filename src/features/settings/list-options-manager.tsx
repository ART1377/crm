"use client";

import { useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/axios";
import { useListOptions } from "@/hooks/use-list-options";
import toast from "react-hot-toast";
import { Plus, Trash2, Pencil, List } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/shared/delete-dialog";

interface ListOptionsManagerProps {
  type: "SOURCE" | "INDUSTRY";
  title: string;
}

export function ListOptionsManager({ type, title }: ListOptionsManagerProps) {
  const { data: options = [] } = useListOptions(type);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<{ id: string; value: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newValue, setNewValue] = useState("");

  const saveOption = useMutation({
    mutationFn: (data: { value: string }) =>
      editing
        ? apiClient.patch(`/list-options/${editing.id}`, data)
        : apiClient.post("/list-options", { ...data, type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-options", type] });
      toast.success(editing ? "گزینه بروزرسانی شد" : "گزینه اضافه شد");
      setIsDialogOpen(false);
      setEditing(null);
      setNewValue("");
    },
  });

  const deleteOption = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/list-options/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-options", type] });
      toast.success("گزینه حذف شد");
      setDeleting(null);
    },
  });

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
          <p className="text-sm text-muted-foreground text-center py-6">
            هیچ گزینه‌ای ثبت نشده است
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">مقدار</TableHead>
                <TableHead className="text-start w-24">عملیات</TableHead>
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
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "ویرایش گزینه" : "افزودن گزینه جدید"}
            </DialogTitle>
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
              onClick={() => saveOption.mutate({ value: newValue })}
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
        onConfirm={() => deleting && deleteOption.mutate(deleting)}
        title="حذف گزینه"
        isPending={deleteOption.isPending}
      />
    </>
  );
}