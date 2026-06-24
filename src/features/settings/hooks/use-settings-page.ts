"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useSaveSettings, useSettings } from "@/hooks/use-settings";

import type { SenderFormValues } from "../info-form";

export function useSettingsPage() {
  const { data: settings = {}, isLoading } = useSettings();
  const saveSettings = useSaveSettings();
  const { register, handleSubmit, reset } = useForm<SenderFormValues>();
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (Object.keys(settings).length > 0) reset(settings);
  }, []);

  const onSubmit = (data: SenderFormValues) => {
    saveSettings.mutate({ ...data });
  };

  return {
    isLoading,
    activeTab,
    setActiveTab,
    register,
    handleSubmit,
    onSubmit,
    isPending: saveSettings.isPending,
  };
}