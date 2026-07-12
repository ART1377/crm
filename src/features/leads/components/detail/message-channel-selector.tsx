'use client';

import { MessageSquare } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useUpdateChannels } from '@/features/leads/hooks/use-leads';

import BaleIcon from './icon/bale';
import CallIcon from './icon/call';
import EitaaIcon from './icon/eitaa';
import InstagramIcon from './icon/instagram';
import OtherIcon from './icon/other';
import RubikaIcon from './icon/rubika';
import SmsIcon from './icon/sms';
import TelegramIcon from './icon/telegram';
import WhatsappIcon from './icon/whatsapp';
import { MessageChannelBadge } from './message-channel-badge';

const CHANNELS = [
  { key: 'WHATSAPP', label: 'واتساپ', icon: <WhatsappIcon className="h-3.5 w-3.5" /> },
  { key: 'ETA', label: 'ایتا', icon: <EitaaIcon className="h-3.5 w-3.5" /> },
  { key: 'BALE', label: 'بله', icon: <BaleIcon className="h-3.5 w-3.5" /> },
  { key: 'RUBIKA', label: 'روبیکا', icon: <RubikaIcon className="h-3.5 w-3.5" /> },
  { key: 'SMS', label: 'پیامک', icon: <SmsIcon className="h-3.5 w-3.5" /> },
  { key: 'CALL', label: 'تماس', icon: <CallIcon className="h-3.5 w-3.5" /> },
  { key: 'INSTAGRAM', label: 'اینستاگرام', icon: <InstagramIcon className="h-3.5 w-3.5" /> },
  { key: 'TELEGRAM', label: 'تلگرام', icon: <TelegramIcon className="h-3.5 w-3.5" /> },
  { key: 'OTHER', label: 'سایر', icon: <OtherIcon className="h-3.5 w-3.5" /> },
] as const;

interface MessageChannelSelectorProps {
  leadId: string;
  channels: string;
}

export function MessageChannelSelector({ leadId, channels }: MessageChannelSelectorProps) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    channels ? channels.split(',').filter(Boolean) : []
  );
  const updateChannels = useUpdateChannels();

  const toggleChannel = (key: string) => {
    const next = selectedChannels.includes(key)
      ? selectedChannels.filter((k) => k !== key)
      : [...selectedChannels, key];

    setSelectedChannels(next);
    updateChannels.mutate(
      { id: leadId, channels: next.join(',') },
      {
        onSuccess: () => {},
      }
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="h-4 w-4" />
          روش‌های ارتباطی
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map(({ key, label, icon }) => (
            <MessageChannelBadge
              key={key}
              label={label}
              icon={icon}
              isSelected={selectedChannels.includes(key)}
              onClick={() => toggleChannel(key)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
