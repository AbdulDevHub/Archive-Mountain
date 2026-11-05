import { defineConfig } from "vitest/config"

// Tests cover the pure logic (terrain maths, picking, search, routing, data);
// they run in Node with no browser or WebGL needed
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
})
