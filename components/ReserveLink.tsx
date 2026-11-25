"use client";

import type { ReactNode } from "react";
import { reservationLink } from "@/lib/contact";
import { trackEvent } from "@/lib/analytics";

type Props = { children: ReactNode; source: string; className?: string; onClick?: () => void };

export function ReserveLink({ children, source, className, onClick }: Props) {
  const { href, external } = reservationLink;
  return (
    <a
      className={className}
      href={href}
      data-reserve
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
