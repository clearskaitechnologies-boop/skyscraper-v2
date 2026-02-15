// Compatibility shim so old imports "@/db/lib/db/client" keep working.
// Re-export the actual Prisma client from the new location.

import prisma from "@/lib/prisma";

export { prisma };
