"use client";

import { useState } from "react";

import { Pencil, Plus, Settings2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
  useDeleteMessenger,
  useMessengers,
  useToggleMessenger,
} from "@/features/settings/hooks/use-messengers";

import { Messenger } from "../types/settings-types";
import { MessengerDialog } from "./messenger-dialog";

export function MessengersTable() {
  const { data: messengers = [], isLoading } = useMessengers();
  const toggleMessenger = useToggleMessenger();
  const deleteMessenger = useDeleteMessenger();

  const [editing, setEditing] = useState<Messenger | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) return null;

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          مدیریت پیام‌رسان‌ها
        </CardTitle>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="ml-2 h-4 w-4" />
          افزودن پیام‌رسان
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">نام</TableHead>
              <TableHead className="text-start">کلید</TableHead>
              <TableHead className="text-start">وضعیت</TableHead>
              <TableHead className="text-start">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messengers.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="text-muted-foreground">{m.key}</TableCell>
                <TableCell>
                  <Switch
                    checked={m.isActive}
                    onCheckedChange={(checked) =>
                      toggleMessenger.mutate({ id: m.id, isActive: checked })
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(m);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleting(m.id)}>
                      <Trash2 className="text-destructive h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <MessengerDialog
        key={editing?.id ?? "new"}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        messenger={editing}
        onClose={() => setEditing(null)}
      />

      <DeleteConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteMessenger.mutate(deleting);
            setDeleting(null);
          }
        }}
        title="حذف پیام‌رسان"
        isPending={deleteMessenger.isPending}
      />
    </>
  );
}
