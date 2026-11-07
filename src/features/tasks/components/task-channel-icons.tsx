// src/features/tasks/components/task-channel-icons.tsx

'use client';

import BaleIcon from '@/features/leads/components/detail/icon/bale';
import CallIcon from '@/features/leads/components/detail/icon/call';
import EitaaIcon from '@/features/leads/components/detail/icon/eitaa';
import InstagramIcon from '@/features/leads/components/detail/icon/instagram';
import OtherIcon from '@/features/leads/components/detail/icon/other';
import RubikaIcon from '@/features/leads/components/detail/icon/rubika';
import SmsIcon from '@/features/leads/components/detail/icon/sms';
import TelegramIcon from '@/features/leads/components/detail/icon/telegram';
import WhatsappIcon from '@/features/leads/components/detail/icon/whatsapp';

import { useMessengers } from '@/features/settings/hooks/use-messengers';

import { cn, getMessengerLink } from '@/lib/utils';

// ✅ className به‌جای اختیاری، اجباری شد
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
  channels: string;
  phoneNumber: string;
}

export function TaskChannelIcons({ channels, phoneNumber }: TaskChannelIconsProps) {
  const { data: messengers = [] } = useMessengers();

  const channelKeys = channels.split(',').filter(Boolean);

  if (channelKeys.length === 0) {
    return <span className="text-muted-foreground text-xs">---</span>;
  }

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

  return (
    <div className="flex flex-wrap items-center gap-1">
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
    </div>
  );
}
