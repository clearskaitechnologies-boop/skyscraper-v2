"use client";

import { Briefcase, Calendar,Mail, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface JobHistoryEntry {
  role: string;
  project?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface TeamMemberPublicCardProps {
  name: string;
  email: string;
  phone?: string | null;
  title?: string | null;
  role?: string | null;
  headshotUrl?: string | null;
  jobHistory?: JobHistoryEntry[] | any;
  showContactInfo?: boolean;
  className?: string;
}

export function TeamMemberPublicCard({
  name,
  email,
  phone,
  title,
  role,
  headshotUrl,
  jobHistory,
  showContactInfo = true,
  className = ""
}: TeamMemberPublicCardProps) {
  const historyArr = Array.isArray(jobHistory) ? jobHistory : [];
  const totalProjects = historyArr.length;
  const recentProjects = historyArr.slice(0, 3);

  return (
    <Card className={`transition-shadow hover:shadow-lg ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {headshotUrl ? (
              <img
                src={headshotUrl}
                alt={name}
                className="h-16 w-16 rounded-full border-2 border-primary/10 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/10 bg-gradient-to-br from-primary to-accent text-xl font-bold text-white">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              {name}
              {title && (
                <Badge variant="secondary" className="text-[10px]">
                  {title}
                </Badge>
              )}
            </h3>
            {role && (
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  role === "admin"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    : role === "manager"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {role}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showContactInfo && (
          <div className="space-y-2 border-b pb-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${email}`} className="text-primary hover:underline">
                {email}
              </a>
            </div>
            {phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${phone}`} className="text-primary hover:underline">
                  {phone}
                </a>
              </div>
            )}
          </div>
        )}

        {totalProjects > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>Project History ({totalProjects})</span>
            </div>
            <div className="space-y-2 pl-6">
              {recentProjects.map((job: JobHistoryEntry, idx: number) => (
                <div key={idx} className="border-l-2 border-primary/20 py-1 pl-3 text-sm">
                  <div className="font-medium text-foreground">{job.role}</div>
                  {job.project && (
                    <div className="text-xs text-muted-foreground">{job.project}</div>
                  )}
                  {(job.startDate || job.endDate) && (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {job.startDate && new Date(job.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        {job.startDate && job.endDate && " - "}
                        {job.endDate && new Date(job.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  )}
                  {job.description && (
                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {job.description}
                    </div>
                  )}
                </div>
              ))}
              {totalProjects > 3 && (
                <div className="pl-3 text-xs italic text-muted-foreground">
                  + {totalProjects - 3} more project{totalProjects - 3 !== 1 && "s"}
                </div>
              )}
            </div>
          </div>
        )}

        {totalProjects === 0 && (
          <div className="py-2 text-center text-xs text-muted-foreground">
            No project history available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
