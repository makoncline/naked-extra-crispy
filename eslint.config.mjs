import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/static-components": "off",
    },
  },
  {
    ignores: ["playwright-report/**", "test-results/**", "coverage/**"],
  },
];

export default config;
