/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!" + ["superjson"].join("|") + ")"],
};
