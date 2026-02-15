// ESLint config — merges next/core-web-vitals + project rules
// NOTE: .cjs takes precedence over .eslintrc.json — keep rules here
module.exports = {
  extends: ["next/core-web-vitals", "prettier"],
  plugins: ["simple-import-sort", "tailwindcss"],
  rules: {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "tailwindcss/classnames-order": "warn",
    "tailwindcss/no-custom-classname": "off",
    "tailwindcss/no-inline-styles": "off",
    "react/forbid-dom-props": "off",
    "react/forbid-component-props": "off",
    "jsx-a11y/aria-proptypes": "off",
    "@next/next/no-img-element": "off",
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "@/src/lib/tokens",
            message: "❌ Import from '@/src/lib/tokens/index' instead (new usage_tokens system)",
          },
        ],
      },
    ],
    "no-restricted-syntax": [
      "error",
      {
        selector: "CallExpression[callee.object.name='pool'][callee.property.name='end']",
        message: "❌ Do not call pool.end() in API routes! Use client.release() instead.",
      },
      {
        selector: "CallExpression[callee.object.name='pgPool'][callee.property.name='end']",
        message: "❌ Do not call pgPool.end() in API routes! Use client.release() instead.",
      },
      {
        selector: "NewExpression[callee.name='Pool']",
        message: "❌ Do not create new Pool()! Import shared pgPool from '@/lib/db'.",
      },
    ],
  },
  settings: {
    tailwindcss: {
      callees: ["clsx", "cn", "cva", "tv"],
    },
  },
};
