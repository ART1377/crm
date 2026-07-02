import Link from "next/link";

import { type LucideIcon } from "lucide-react";

interface InfoItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
  dir?: "rtl" | "ltr";
  href?: string;
}

export function InfoItem({ icon: Icon, label, value, dir = "rtl", href }: InfoItemProps) {
  const content = (
    <>
      <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p
          className={`text-sm font-medium ${href ? "text-primary cursor-pointer hover:underline" : ""}`}
          dir={dir}
        >
          {value}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-2">
        {content}
      </Link>
    );
  }

  return <div className="flex items-center gap-2">{content}</div>;
}
