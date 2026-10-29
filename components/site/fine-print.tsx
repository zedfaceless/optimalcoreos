import { DELIVERY } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * The timeline fine print (§3.4, AC-05). Every page that states a delivery time
 * renders this directly underneath that statement.
 */
export function FinePrint({ className }: { className?: string }) {
  return (
    <p className={cn("text-[0.8125rem] leading-relaxed text-gray-600", className)}>{DELIVERY.finePrint}</p>
  );
}
