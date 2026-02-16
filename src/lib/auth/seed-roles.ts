import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function seedRoles() {
  const roles = ["ADMIN", "MANAGER", "FIELD", "VIEWER"];

  for (const roleName of roles) {
    await prisma.permissionRole.upsert({
      where: { name: roleName },
      create: { name: roleName },
      update: {},
    });
  }

  logger.debug("✅ Roles seeded:", roles);
}

// Run this manually or via an admin endpoint
// seedRoles().catch(console.error);
