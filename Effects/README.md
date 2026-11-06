# Effects

Small visual effects: cursors, WebGL fluids, loaders, hover states, sliders and layouts. Each one lives in its own folder with an `index.html`, so you can copy a folder straight into another site.

**[Try them in the Effects Playground →](https://archive-mountain.netlify.app/Effects/Playground/)**

The [Playground](./Playground) is one page that loads each effect's folder in a live preview, with a filter, keyboard arrows, deep links (`#fire-cursor`) and links to the source. Its list is [`Playground/effects.json`](./Playground/effects.json): add an entry there to show a new effect.

A few effects in this folder aren't in the Playground (Ghost Eyes, Moving Squares Animation, Animated Input Border, Magic Card, Shine Effect, Balloon Spawn Effect). They still work on their own.

Sky Diving Parallax Cat is a React + Vite app, so the full build compiles it and the Playground loads the built page.
