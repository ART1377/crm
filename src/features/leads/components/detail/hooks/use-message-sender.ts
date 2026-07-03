'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import { useMessengers } from '@/features/settings/hooks/use-messengers';
import { useSettings } from '@/features/settings/hooks/use-settings';

import { getMessengerLink, replaceTemplateVars } from '@/lib/utils';

interface UseMessageSenderProps {
  phone: string;
  companyName: string;
  contactPerson?: string | null;
}

export function useMessageSender({ phone, companyName, contactPerson }: UseMessageSenderProps) {
  const { data: settings = {} } = useSettings();
  const { data: messengers = [] } = useMessengers();
  const [selectedMessengerId, setSelectedMessengerId] = useState('');

  const activeMessengers = messengers.filter((m) => m.isActive);
  const selectedMessenger = activeMessengers.find((m) => m.id === selectedMessengerId);
  const canSend = !!selectedMessenger;

  const getMessage = (content: string) =>
    replaceTemplateVars(content, {
      senderName: settings.senderName || 'صادقی',
      senderPhone: settings.senderPhone || '09191234567',
      senderCompany: settings.senderCompany || 'حسابداری کیهان',
      companyName,
      contactPerson,
    });

  const handleSend = (content: string) => {
    if (!selectedMessenger) {
      toast.error('لطفاً پیام‌رسان را انتخاب کنید');
      return;
    }
    window.open(
      getMessengerLink(
        selectedMessenger.key,
        phone,
        getMessage(content),
        selectedMessenger.linkTemplate
      ),
      '_blank'
    );
  };

  return {
    getMessage,
    handleSend,
    canSend,
    selectedMessengerId,
    setSelectedMessengerId,
    activeMessengers,
  };
}
