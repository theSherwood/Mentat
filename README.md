# TiddlyWiki Plugin Skeleton for ThirdFlow

Use this plugin skeleton to easily develop TiddlyWiki5 plugins using the
_[ThirdFlow](https://github.com/TheDiveO/ThirdFlow)_ plugin. For an easy
introduction, you may want to [watch the demo video](https://youtu.be/BFE6PFZ_uWQ).

# How To

0. clone this repository:
   `git clone https://github.com/TheDiveO/TiddlyWikiPluginSkeleton.git`.

1. optionally edit `package.json` and fill in necessary data, such as `name`,
   `version`, `author`, `homepage`, `license`, et cetera; the impatient can skip
    this step for the moment. This information becomes important only later if
    you intend to publish your TiddlyWiki5 plugin to the NPM registory, or
    want to prepare the option at least.

2. run `npm install` to install the required TiddlyWiki5 core, as well as the
   _ThirdFlow_ plugin from the NPM registry.

3. run `npm run develop`.

4. next, navigate to http://localhost:8080 in your web browser.

5. follow the instructions given in the "Plugin Kickstarter" to create your
   plugin.

6. start working on your plugin...

7. when you're ready, simply run `npm run release` to create release file(s)
   in `editions/release/output`.

# Notes

1. in the default setup, the release files won't be under `git` source code
   control. The rationale is to keep generated files out of the manged sources.
   However, if you want to keep them under `git` control, simply remove the
   file `.gitignore` in `editions/release/`
