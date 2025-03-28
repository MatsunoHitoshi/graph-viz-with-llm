module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:@typescript-eslint/recommended",
    // 他の拡張設定...
  ],
  rules: {
    "@typescript-eslint/no-unsafe-assignment": "warn", // または 'error'
    // 他のルール...
  },
};
