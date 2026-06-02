import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names without conflicts.
 * clsx resolves conditional/array class inputs; twMerge dedupes
 * conflicting Tailwind utilities (e.g. `px-2 px-4` -> `px-4`).
 * Aceternity / shadcn components import this as `cn` from `@/lib/utils`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
