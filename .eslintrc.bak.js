module.exports = {
  extends: ["next", "turbo", "prettier"],
  plugins: ["local"],
  rules: {
    "local/no-direct-clerk-orgid": "error",
  },
};
