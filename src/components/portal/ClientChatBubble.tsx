import React from "react";

export function ClientChatBubble({ body, senderType, createdAt }: { body: string; senderType: string; createdAt: Date }) {
  const isContractor = senderType === 'contractor';
  return (
    <div className={`max-w-xs rounded px-3 py-2 text-sm ${isContractor ? 'ml-auto bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} `}>
      <div>{body}</div>
      <div className="mt-1 text-[10px] opacity-70">{createdAt.toLocaleTimeString()}</div>
    </div>
  );
}
