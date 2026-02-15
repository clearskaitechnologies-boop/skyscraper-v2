/**
 * RAVEN Custom ESLint Rules
 * Enforces safe patterns in Next.js App Router pages
 */

module.exports = {
  rules: {
    // Prevent throw statements in page components
    "no-throw-in-pages": {
      meta: {
        type: "problem",
        docs: {
          description: "Disallow throw statements in Next.js page components",
          category: "Best Practices",
          recommended: true,
        },
        messages: {
          noThrowInPage:
            'Do not use "throw" in page components. Return empty states or error components instead.',
        },
      },
      create(context) {
        const filename = context.getFilename();
        const isPageComponent = filename.includes("/app/") && filename.endsWith("page.tsx");

        if (!isPageComponent) {
          return {};
        }

        return {
          ThrowStatement(node) {
            context.report({
              node,
              messageId: "noThrowInPage",
            });
          },
        };
      },
    },
  },
};
