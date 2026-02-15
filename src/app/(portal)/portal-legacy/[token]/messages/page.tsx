import { ClientChatBubble } from "@/components/portal/ClientChatBubble";
import { validatePortalToken } from "@/lib/portalAuth";
import prisma from "@/lib/prisma";

export default async function MessagesPage({ params }: { params: { token: string } }) {
  const tokenData = await validatePortalToken(params.token);
  if (!tokenData) return <div className="py-20 text-center">Invalid or expired link.</div>;

  // Find message threads for this claim that are visible to portal
  const threads = await prisma.messageThread.findMany({
    where: { claimId: tokenData.claimId, isPortalThread: true },
    include: { Message: { orderBy: { createdAt: "asc" } } },
  });

  // Flatten messages from all threads
  const msgs = threads.flatMap((t) => t.Message);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Messages</h1>
      {msgs.length === 0 && <p className="text-sm text-gray-500">No messages yet.</p>}
      <div className="flex flex-col gap-2">
        {msgs.map((m) => (
          <ClientChatBubble
            key={m.id}
            body={m.body}
            senderType={m.senderType}
            createdAt={m.createdAt}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400">Two-way sending coming soon.</p>
    </div>
  );
}
