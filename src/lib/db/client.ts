// src/lib/db/client.ts
// Consolidated re-export of the canonical Prisma singleton to prevent
// accidental multiple client instantiations (pool exhaustion risk).
// All imports of "@/lib/db/client" now transparently use the single
// instance defined in "@/lib/prisma".
import prisma from "@/lib/prisma";

export { prisma };
export default prisma;
