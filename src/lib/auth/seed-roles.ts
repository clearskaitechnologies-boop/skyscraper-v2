import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

export async function seedRoles() {
  const roles = ["ADMIN", "MANAGER", "FIELD", "VIEWER"];

  for (const roleName of roles) {
    await prisma.permission_roles.upsert({
      where: { name: roleName },
      create: { name: roleName },
      update: {},
    });
  }

  logger.debug("✅ Roles seeded:", roles);
}

// Run this manually or via an admin endpoint
// seedRoles().catch(console.error);
