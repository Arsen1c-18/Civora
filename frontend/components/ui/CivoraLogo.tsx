"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export interface CivoraLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  showTagline?: boolean;
  variant?: "light" | "dark" | "navy";
  href?: string;
  className?: string;
}

export function CivoraEmblem({
  size = 32,
  className = "",
}: {
  size?: number;
  variant?: "light" | "dark" | "navy";
  className?: string;
}) {
  return (
    <Image
      src="/civora-logo.png"
      alt="CIVORA Logo"
      width={size}
      height={size}
      className={`object-contain shrink-0 ${className}`}
      priority
    />
  );
}

export function CivoraLogo({
  size = "md",
  showWordmark = true,
  showTagline = false,
  variant = "light",
  href,
  className = "",
}: CivoraLogoProps) {
  const sizeMap = {
    xs: { emblem: 22, text: "text-sm", tag: "text-[9px]" },
    sm: { emblem: 28, text: "text-base", tag: "text-[10px]" },
    md: { emblem: 34, text: "text-lg", tag: "text-[11px]" },
    lg: { emblem: 48, text: "text-2xl", tag: "text-xs" },
    xl: { emblem: 64, text: "text-3xl", tag: "text-sm" },
  };

  const currentSize = sizeMap[size];
  const textColor = variant === "navy" ? "text-white" : "text-[#101D32]";
  const tagColor = variant === "navy" ? "text-teal-300" : "text-[#64748B]";

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <CivoraEmblem size={currentSize.emblem} variant={variant} />
      {showWordmark && (
        <span className="flex flex-col text-left leading-tight">
          <span className={`font-extrabold tracking-tight font-sans ${currentSize.text} ${textColor}`}>
            CIVORA
          </span>
          {showTagline && (
            <span className={`font-medium tracking-normal ${currentSize.tag} ${tagColor}`}>
              AI-Powered Grievance Redressal
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="group transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded">
        {content}
      </Link>
    );
  }

  return content;
}
