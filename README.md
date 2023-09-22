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
* Improve performance enough that animation system works fine, even when animation is run in real-time/full-speed. (not needed immediately, since initial animation will render frame-by-frame) [NOTE: it's maybe already fast enough, but probably not]
* MS animation system works properly, even in cases where the user interacts with nodes and changes their sizes. (not needed immediately, since initial animation use-cases don't have this sort of user interaction)
* MS the "align with parent" option works again.
* There's still some code from the old implementation that's not useful anymore and needs to be removed.

Long term:
* n/a