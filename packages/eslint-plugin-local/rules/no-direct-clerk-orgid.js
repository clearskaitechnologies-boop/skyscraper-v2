/**
 * ESLint rule: no-direct-clerk-orgid
 * Disallow direct usage of auth().orgId or Clerk orgId in app code.
 * Enforce use of getOrgContext() or ensureUserOrgContext().
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow direct usage of auth().orgId; enforce canonical org context.",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      noDirectOrgId:
        "Do not use auth().orgId or Clerk orgId directly. Use getOrgContext() instead.",
    },
    schema: [],
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object &&
          node.object.type === "CallExpression" &&
          node.object.callee.name === "auth" &&
          node.property &&
          node.property.name === "orgId"
        ) {
          context.report({
            node,
            messageId: "noDirectOrgId",
          });
        }
      },
      Identifier(node) {
        if (node.name === "clerkOrgId") {
          context.report({
            node,
            messageId: "noDirectOrgId",
          });
        }
      },
    };
  },
};
