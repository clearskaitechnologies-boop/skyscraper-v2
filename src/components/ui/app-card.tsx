import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AppCard({ className, children, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "rounded-3xl border border-border bg-card text-card-foreground shadow-lg",
        "transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}

export function AppCardSoft({ className, children, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "rounded-3xl border border-border bg-secondary/30 text-card-foreground shadow-md",
        "transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}

export { CardContent, CardDescription, CardFooter,CardHeader, CardTitle };
