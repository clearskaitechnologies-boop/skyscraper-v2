import { FileText, Home, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

export function WelcomeScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Home className="h-10 w-10 text-primary" />
      </div>

      <h1 className="mb-3 text-3xl font-bold text-foreground">Welcome to Your Claim Portal</h1>

      <p className="mb-8 max-w-xl text-base text-muted-foreground">
        Track your claim, message your team, and view documents—all in one place. Once your
        contractor links your claim, you'll see live updates here.
      </p>

      <div className="mb-10 grid max-w-2xl gap-6 sm:grid-cols-3">
        <Link
          href="/portal/feed"
          className="group rounded-xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/50 hover:shadow-md"
        >
          <div className="mb-3 flex justify-center">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 font-semibold text-foreground">Track Your Claim</h3>
          <p className="text-sm text-muted-foreground">
            See status, documents, and updates in real-time
          </p>
        </Link>

        <Link
          href="/portal/messages"
          className="group rounded-xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/50 hover:shadow-md"
        >
          <div className="mb-3 flex justify-center">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 font-semibold text-foreground">Message Your Team</h3>
          <p className="text-sm text-muted-foreground">
            Text your contractor and get instant notifications
          </p>
        </Link>

        <Link
          href="/portal/profile"
          className="group rounded-xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/50 hover:shadow-md"
        >
          <div className="mb-3 flex justify-center">
            <Phone className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 font-semibold text-foreground">Update Your Info</h3>
          <p className="text-sm text-muted-foreground">Manage contact details and preferences</p>
        </Link>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-2">
          <span className="text-primary">✓</span> Your claim will appear here once it&apos;s linked
        </p>
        <p className="flex items-center justify-center gap-2">
          <span className="text-primary">✓</span> You&apos;ll receive email notifications for
          updates
        </p>
        <p className="flex items-center justify-center gap-2">
          <span className="text-primary">✓</span> Contact your contractor if you have questions
        </p>
      </div>
    </div>
  );
}
