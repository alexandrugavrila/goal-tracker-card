import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/goal-tracker-card.js",
  output: [
    {
      file: "goal-tracker-card.js",
      format: "es",
    },
    {
      file: "custom_components/goal_tracker/www/goal-tracker-card.js",
      format: "es",
    },
    {
      file: "dev_instance/config/www/custom-cards/goal-tracker-card.js",
      format: "es",
    },
  ],
  plugins: [nodeResolve()],
};
