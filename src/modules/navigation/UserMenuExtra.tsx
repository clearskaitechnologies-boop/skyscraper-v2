"use client";

/**
 * User Menu Extra Items
 * Additional links for avatar dropdown menu
 */

import { Palette, Settings } from "lucide-react";
import Link from "next/link";
import React from "react";

export function UserMenuExtra() {
  return (
    <>
      <Link
        href="/settings/branding"
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
      >
        <Palette className="h-4 w-4" />
        Branding
      </Link>
      <Link
        href="/settings"
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
      >
        <Settings className="h-4 w-4" />
        Company Settings
      </Link>
    </>
  );
}
