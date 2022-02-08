# Tree Grapher

Library for calculating where to draw tree nodes, while avoiding overlap.

### Installation

* 1\) `npm install tree-grapher --save-exact`
> The `--save-exact` flag is recommended (to disable version-extending), since this package uses [Explicit Versioning](https://medium.com/sapioit/why-having-3-numbers-in-the-version-name-is-bad-92fc1f6bc73c) (`Release.Breaking.FeatureOrFix`) rather than SemVer (`Breaking.Feature.Fix`).
>
> For `FeatureOrFix` version-extending (recommended for libraries), prepend "`~`" in `package.json`. (for `Breaking`, prepend "`^`")

### Examples

* 1\) Clone/download repo to disk.
* 2\) Run: `npm install`
* 3\) Run: `npm run examples-dev`
* 4\) Navigate to `localhost:8080` in your browser.

### TODO

Short term:
* Ensure that the system still works when a NodeChildHolder is displayed *below* the parent box. (as in DM-repo in some cases)
* MS you can specify a padding between node-boxes.

Long term:
* MS a highly-customizable connector-line system is included with the library.