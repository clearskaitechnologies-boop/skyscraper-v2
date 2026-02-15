import prisma from "@/lib/prisma";

export async function seedRoles() {
  const roles = ["ADMIN", "MANAGER", "FIELD", "VIEWER"];

  for (const roleName of roles) {
    await prisma.permissionRole.upsert({
      where: { name: roleName },
      create: { name: roleName },
      update: {},
    });
  }

  console.log("✅ Roles seeded:", roles);
}

// Run this manually or via an admin endpoint
// seedRoles().catch(console.error);
