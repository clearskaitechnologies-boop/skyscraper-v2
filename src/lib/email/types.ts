// src/lib/email/types.ts
export type PacketRecipientType = "adjuster" | "homeowner" | "internal";

export interface SendPacketRequestBody {
  to: string;
  cc?: string;
  subject: string;
  message: string;
  recipientType: PacketRecipientType;
}

export interface DraftedPacketEmail {
  to: string;
  cc?: string;
  subject: string;
  message: string;
  recipientType: PacketRecipientType;
  packetUrl: string;
}
