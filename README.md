# Tree Grapher

Library for calculating where to draw tree nodes, while avoiding overlap.

## Installation

* 1\) `npm install tree-grapher --save-exact`
> The `--save-exact` flag is recommended (to disable version-extending), since this package uses [Explicit Versioning](https://medium.com/sapioit/why-having-3-numbers-in-the-version-name-is-bad-92fc1f6bc73c) (`Release.Breaking.FeatureOrFix`) rather than SemVer (`Breaking.Feature.Fix`).
>
> For `FeatureOrFix` version-extending (recommended for libraries), prepend "`~`" in `package.json`. (for `Breaking`, prepend "`^`")

## Examples

* 1\) Clone/download repo to disk.
* 2\) Run: `npm install`
* 3\) Run: `npm run examples-dev`
* 4\) Navigate to `localhost:8080` in your browser.

## Tasks

Short term:
* There are some hard-coded things (like the padding for map-ui, and vertical-spacing between nodes) that need to be un-hard-coded.
* MS the "align with parent" option works again.
* There's still lots of stuff from the old implementation that's not useful anymore and needs to be removed.

Long term:
* Add system that uses dynamic x-ranges for the columns, based on the encountered node-group rects. This enables the system to avoid spurious "collisions", creating more compact graphs, while not giving up (most of) the "easier to reason about" qualities of distinct column entries. (the column entries are at dynamic positions/sizes, but the visualizer makes these rects clear, so still keeps the reasoning/debugging process straightforward)
* Fix glitch where if a node-ui-inner shrinks horizontally such that it also changes the height (due to browser layout system), it can cause the connector-lines to target the wrong (diff from border is -X rather than +X) positions. You can see this in the demo, by enabling x3 on the "0.0" node, then increasing its width, then decreasing its width. [not terribly high priority, since such resizing is expected to be rare in actual programs]