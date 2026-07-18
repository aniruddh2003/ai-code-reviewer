import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMemory(bytes: number | string | undefined): string {
  if (bytes === undefined || bytes === null) return "0.0MB";
  const num = typeof bytes === "string" ? parseFloat(bytes) : bytes;
  if (isNaN(num)) return "0.0MB";
  // If it's already a small number (less than 1000), assume it's already in MB
  if (num < 1024 && num > 0) return `${num.toFixed(1)}MB`;
  return `${(num / 1024 / 1024).toFixed(1)}MB`;
}

export function formatRuntime(ms: number | string | undefined): string {
  if (ms === undefined || ms === null) return "0ms";
  const num = typeof ms === "string" ? parseFloat(ms) : ms;
  if (isNaN(num)) return "0ms";
  return `${Math.round(num)}ms`;
}
