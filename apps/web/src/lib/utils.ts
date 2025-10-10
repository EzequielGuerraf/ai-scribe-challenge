import { clsx } from "clsx";
/** Small helper to conditionally join classes. */
export function cn(...args: any[]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return clsx(args);
}
