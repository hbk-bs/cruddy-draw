export default {
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  useTabs: false,
  proseWrap: "always",
  printWidth: 80,
  overrides: [
    {
      files: ["*.yml", "*.yaml"],
      options: {
        useTabs: false,
      },
    },
  ],
};
