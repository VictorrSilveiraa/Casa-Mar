"use client";

import type { ReactNode } from "react";
import { reservationLink } from "@/lib/contact";
import { trackEvent } from "@/lib/analytics";

type Props = { children: ReactNode; source: string; className?: string; onClick?: () => void; fill?: boolean };

export function ReserveLink({ children, source, className, onClick, fill = false }: Props) {
  const { href, external } = reservationLink;
  return (
    <a
      className={className}
      href={href}
      data-reserve
      data-fill={fill || undefined}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={() => {
        if (external) trackEvent("whatsapp_click", { source });
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}
