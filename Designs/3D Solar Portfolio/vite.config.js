import { defineConfig } from "vite"

export default defineConfig({
  // build.sh sets BASE_PATH to the folder the static deploy serves this app from
  base: process.env.BASE_PATH ?? "/",
})
