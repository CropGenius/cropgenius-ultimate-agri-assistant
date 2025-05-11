
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function to conditionally join tailwind classes
 */
export function cn(...inputs: (string | undefined | null | false | 0)[]) {
  return twMerge(clsx(inputs));
}
