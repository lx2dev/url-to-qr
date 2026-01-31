import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { env } from "@/env"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return env.NEXT_PUBLIC_URL
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`
  }
  return url
}

export function isValidUrl(url: string): boolean {
  try {
    const normalizedUrl = normalizeUrl(url)

    const parsed = new URL(normalizedUrl)
    const hostname = parsed.hostname
    if (
      hostname.endsWith(".") ||
      !hostname.includes(".") ||
      hostname.startsWith(".") ||
      /[^a-zA-Z0-9.-]/.test(hostname)
    ) {
      return false
    }

    const tld = hostname.split(".").pop() || ""
    if (tld.length < 2) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export function formatUrlForDisplay(
  url: string,
  maxLength: number = 50,
): string {
  if (url.length <= maxLength) return url
  return `${url.substring(0, maxLength)}...`
}

export function generateQRFilename(url: string): string {
  const timestamp = Date.now()
  const sanitized = url
    .replace(/https?:\/\//, "")
    .replace(/[^a-z0-9]/gi, "-")
    .substring(0, 20)

  return `qr-${sanitized}-${timestamp}.png`
}
