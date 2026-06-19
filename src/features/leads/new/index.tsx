"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateLead } from "@/hooks/use-leads";
import { leadSchema } from "@/lib/validations";
import type { CreateLeadData } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LeadForm } from "./form";
import { LeadFormActions } from "./actions";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { PageHeader } from "@/components/shared/page-header";

export function NewLeadPage() {
  const router = useRouter();
  const createLead = useCreateLead();

  const form = useForm<CreateLeadData>({
    resolver: zodResolver(leadSchema),
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
    await createLead.mutateAsync(data);
    router.push("/leads");
  };

  return (
    <PageWrapper
      header={
        <PageHeader
          title="افزودن سرنخ جدید"
          description="اطلاعات کسب‌وکار جدید را وارد کنید"
        />
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
            <LeadFormActions
              onCancel={() => router.back()}
              isPending={createLead.isPending}
            />
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
