"use client";

import { useForm } from "react-hook-form";

import type { CreateLeadData } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { PageHeader } from "@/components/shared/page-header";
import { PageWrapper } from "@/components/shared/page-wrapper";

import { useCreateLead } from "@/hooks/use-leads";

import { leadSchema } from "@/lib/validations";

import { LeadFormActions } from "./actions";
import { LeadForm } from "./form";

export function NewLeadPage() {
  const createLead = useCreateLead();

  const form = useForm<CreateLeadData>({
    resolver: zodResolver(leadSchema),
    mode: "onChange", // Validate on change after first touch
    defaultValues: {
      businessName: "",
      contactPerson: "",
      phoneNumber: "",
      secondaryPhone: "",
      industry: "",
      source: "",
      notes: "",
    },
  });

  const onSubmit = async (data: CreateLeadData) => {
    await createLead.mutateAsync(data, {
      onSuccess: () => {
        form.reset(); // Clear all fields
      },
    });
  };

  return (
    <PageWrapper
      header={
        <PageHeader title="افزودن سرنخ جدید" description="اطلاعات کسب‌وکار جدید را وارد کنید" />
      }
    >
      <Card className="flex-1 overflow-y-auto">
        <CardHeader>
          <CardTitle>اطلاعات سرنخ</CardTitle>
          <CardDescription>فیلدهای ستاره‌دار (*) الزامی هستند</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-8">
            <LeadForm form={form} />
            <LeadFormActions onCancel={() => form.reset()} isPending={createLead.isPending} />
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
