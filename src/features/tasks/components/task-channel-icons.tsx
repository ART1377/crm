// src/features/tasks/components/task-channel-icons.tsx

'use client';

import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, MessageCircle, Pencil, X } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import BaleIcon from '@/features/leads/components/detail/icon/bale';
import CallIcon from '@/features/leads/components/detail/icon/call';
import EitaaIcon from '@/features/leads/components/detail/icon/eitaa';
import InstagramIcon from '@/features/leads/components/detail/icon/instagram';
import OtherIcon from '@/features/leads/components/detail/icon/other';
import RubikaIcon from '@/features/leads/components/detail/icon/rubika';
import SmsIcon from '@/features/leads/components/detail/icon/sms';
import TelegramIcon from '@/features/leads/components/detail/icon/telegram';
import WhatsappIcon from '@/features/leads/components/detail/icon/whatsapp';

import { useUpdateChannels } from '@/features/leads/hooks/use-leads';
import { useMessengers } from '@/features/settings/hooks/use-messengers';

import { TASKS_QUERY_KEY } from '@/lib/query-keys';
import { cn, getMessengerLink } from '@/lib/utils';

type IconComponent = React.ComponentType<{ className: string }>;

const CHANNEL_META: Record<string, { icon: IconComponent; label: string; color: string }> = {
  WHATSAPP: { icon: WhatsappIcon, label: 'واتساپ', color: 'text-emerald-600' },
  ETA: { icon: EitaaIcon, label: 'ایتا', color: 'text-orange-500' },
  BALE: { icon: BaleIcon, label: 'بله', color: 'text-blue-500' },
  RUBIKA: { icon: RubikaIcon, label: 'روبیکا', color: 'text-purple-500' },
  SMS: { icon: SmsIcon, label: 'پیامک', color: 'text-amber-600' },
  CALL: { icon: CallIcon, label: 'تماس', color: 'text-blue-600' },
  INSTAGRAM: { icon: InstagramIcon, label: 'اینستاگرام', color: 'text-pink-500' },
  TELEGRAM: { icon: TelegramIcon, label: 'تلگرام', color: 'text-sky-500' },
  OTHER: { icon: OtherIcon, label: 'سایر', color: 'text-muted-foreground' },
};

interface TaskChannelIconsProps {
  leadId: string;
  channels: string;
  phoneNumber: string;
}

export function TaskChannelIcons({ leadId, channels, phoneNumber }: TaskChannelIconsProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: messengers = [] } = useMessengers();
  const updateChannels = useUpdateChannels();

  const channelKeys = channels ? channels.split(',').filter(Boolean) : [];

  const getLink = (channelKey: string): string | null => {
    if (channelKey === 'CALL') return `tel:${phoneNumber}`;

    if (channelKey === 'SMS') {
      return `sms:${phoneNumber.replace(/[^0-9]/g, '')}`;
    }

    if (channelKey === 'INSTAGRAM' || channelKey === 'TELEGRAM') {
      return null;
    }

    const messenger = messengers.find((m) => m.key === channelKey);
    if (messenger?.linkTemplate) {
      return getMessengerLink(channelKey, phoneNumber, '', messenger.linkTemplate);
    }

    const clean = phoneNumber.replace(/[^0-9]/g, '');
    if (channelKey === 'WHATSAPP') return `https://wa.me/${clean}`;
    if (channelKey === 'ETA') return `https://eitaa.com/${clean}`;
    if (channelKey === 'BALE') return `https://ble.ir/${clean}`;
    if (channelKey === 'RUBIKA') return `https://rubika.ir/${clean}`;

    return null;
  };

  const toggleChannel = (key: string) => {
    const next = channelKeys.includes(key)
      ? channelKeys.filter((k) => k !== key)
      : [...channelKeys, key];

    updateChannels.mutate(
      { id: leadId, channels: next.join(',') },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        },
      }
    );
  };

  // اگر هیچ کانالی وجود ندارد، فقط «---» نمایش بده (بدون تریگر)
  if (channelKeys.length === 0) {
    return <span className="text-muted-foreground text-xs">---</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {/* نمایش کانال‌های فعلی */}
      {channelKeys.map((key) => {
        const meta = CHANNEL_META[key];
        if (!meta) return null;

        const Icon = meta.icon;
        const link = getLink(key);
        const isClickable = Boolean(link);

        return (
          <button
            key={key}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (link) window.open(link, '_blank');
            }}
            disabled={!isClickable}
            title={isClickable ? `پیام در ${meta.label}` : meta.label}
            className={cn(
              'inline-flex h-6 w-6 items-center justify-center rounded-md transition-all',
              isClickable
                ? 'hover:bg-muted cursor-pointer hover:scale-110'
                : 'cursor-default opacity-50'
            )}
          >
            <Icon className={cn('h-4 w-4', meta.color)} />
          </button>
        );
      })}

      {/* ✅ دکمه ویرایش با آیکون Pencil و استایل واضح */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            title="ویرایش روش‌های ارتباطی"
            className="text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary border-border bg-background inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border transition-all"
          >
            {updateChannels.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Pencil className="h-3 w-3" />
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-72 overflow-hidden p-0"
          align="end"
          sideOffset={6}
          onClick={(e) => e.stopPropagation()}
        >
          {/* هدر */}
          <div className="from-primary/5 to-background border-b bg-gradient-to-l p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-md">
                  <MessageCircle className="text-primary h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold">روش‌های ارتباطی</p>
                  <p className="text-muted-foreground text-[10px]">
                    {channelKeys.length} کانال فعال
                  </p>
                </div>
              </div>
              <span className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold">
                {channelKeys.length}
              </span>
            </div>
          </div>

          {/* گرید کانال‌ها */}
          <div className="max-h-72 overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(CHANNEL_META).map(([key, meta]) => {
                const Icon = meta.icon;
                const isActive = channelKeys.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleChannel(key)}
                    disabled={updateChannels.isPending}
                    className={cn(
                      'group relative inline-flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-start text-[11px] font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50',
                      isActive
                        ? 'border-primary/30 bg-primary/5 text-foreground shadow-sm'
                        : 'text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground border-transparent'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors',
                        isActive ? 'bg-white shadow-sm' : 'bg-muted/50 group-hover:bg-white'
                      )}
                    >
                      <Icon className={cn('h-3.5 w-3.5', meta.color)} />
                    </div>
                    <span className="flex-1 truncate">{meta.label}</span>
                    {isActive && (
                      <Check className="text-primary h-3 w-3 shrink-0" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* فوتر */}
          <div className="bg-muted/30 flex items-center justify-between border-t px-3 py-2">
            <p className="text-muted-foreground text-[10px]">
              {updateChannels.isPending ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  در حال ذخیره...
                </span>
              ) : (
                'برای حذف، کلیک کنید'
              )}
            </p>
            {channelKeys.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateChannels.mutate(
                    { id: leadId, channels: '' },
                    {
                      onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
                      },
                    }
                  );
                }}
                disabled={updateChannels.isPending}
                className="text-muted-foreground hover:text-destructive inline-flex cursor-pointer items-center gap-1 text-[10px] transition-colors"
              >
                <X className="h-2.5 w-2.5" />
                پاک کردن همه
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
