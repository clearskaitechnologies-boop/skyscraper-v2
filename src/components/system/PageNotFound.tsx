import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PageNotFoundProps {
  title?: string;
  description?: string;
  resourceType?: string;
}

/**
 * Page Not Found Component
 * 
 * Displays a friendly 404 message when a resource is not found.
 * Use in page.tsx after data fetching when resource doesn't exist.
 * 
 * Usage:
 * ```tsx
 * const claim = await prisma.claims.findUnique({ where: { id } });
 * 
 * if (!claim) {
 *   return <PageNotFound resourceType="Claim" />;
 * }
 * ```
 */
export function PageNotFound({
  title = "Not Found",
  description = "The resource you're looking for doesn't exist or you don't have access to it",
  resourceType,
}: PageNotFoundProps) {
  const displayTitle = resourceType ? `${resourceType} Not Found` : title;
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-500/10">
              <FileQuestion className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <CardTitle className="text-lg">{displayTitle}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
