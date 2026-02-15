// Re-export bootstrap-new-org from scripts directory
export { bootstrapNewOrg } from "../../scripts/bootstrap-new-org";
import prismaDefault from "@/lib/prisma";
export const prisma = prismaDefault;
