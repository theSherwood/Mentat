# TiddlyWiki Plugin Skeleton for ThirdFlow

Use this plugin skeleton to easily develop TiddlyWiki5 plugins using the
_[ThirdFlow](https://github.com/TheDiveO/ThirdFlow)_ plugin. For an easy
introduction, you may want to [watch the demo video](https://youtu.be/BFE6PFZ_uWQ).

# How To (Set Up and Release)

1. Set Up...

    0. clone this repository:
       `$ git clone https://github.com/TheDiveO/TiddlyWikiPluginSkeleton.git`.
       Optionally specify a different directory to clone into other than
       `TiddlyWikiPluginSkeleton`, by simply appending the new directory name to the
       git clone command. For instance:
       `$ git clone https://github.com/TheDiveO/TiddlyWikiPluginSkeleton.git NewPlugin`,
       where `NewPlugin` is the directory to clone the plugin skeleton into.

    1. optionally edit `package.json` and fill in necessary data, such as `name`,
       `version`, `author`, `homepage`, `license`, et cetera; the impatient can skip
        this step for the moment. This information becomes important only later if
        you intend to publish your TiddlyWiki5 plugin to the NPM registory, or
        want to prepare the option at least.

    2. run `npm install` to install the required TiddlyWiki5 core, as well as the
       _ThirdFlow_ plugin from the NPM registry.

    3. run `$ npm run develop`.

    4. next, navigate to http://localhost:8080 in your web browser.

    5. follow the instructions given in the "Plugin Kickstarter" to create your
      plugin.

2. Develop...

    * work on your plugin ... you can freely mix developing things inside the
      web browser as well as outside the browser using a standalone editor.

    * Don't forget to stop and then restart `$ npm run develop` after you've
      made changes to TiddlyWiki files outside your web browser.

3. Release...

    7. to control which files to release, visit your TiddlyWiki's `$:/ControlPanel`
       and go to the `ThirdFlow` tab. Then click on the subtab named `Release`.
       Follow the instructions given there. Please note that you can develop
       multiple plugins simultaneously from the same development TiddlyWiki.

    8. when you're ready to release, simply run `$ npm run release` to create the
       release file(s) in `editions/release/output`. Rinse, then repeat as
       necessary.


# Re-Initialize Plugin Git Repository

As you started from a _cloned_ repository that doesn't belong to you and to
which you have no write access to, you will most probably want to put this
former skeleton repository under control of your own git repository. To do
so, simple follow this receipe:

1. `$ rm -rf .git` in **this repository's top directory** removes the now
   unnecessary skeleton git repository copy, so you can start afresh.

2. `$ git init` ... sets up a new git repository for your new plugin.

3. Did you adjust `package.json`? If not, please do so now.

4. `$ git add .` ... this adds back in all existing files (unless blocked, see
   especially note #1 below).

5. `$ git commit -m "initializes and populates my plugin repository"` ...
   finally commits all files into your new plugin repository.

6. if you want to add your plugin repo also to GitHub:

   1. while logged into your account on GitHub, create a new repository, **but
      do not** initialize it with any README, license, `.gitignore`, et cetera, files.

   2. copy the remote repository URL and do:
      `$ git remote add origin _copied-git-repository-url_`; remember to
      replace _copied-git-repority-url_ with the real repository URL. Check
      with `$ git remote -v` that the origin reporitory URL was set correctly.

   3. `$ git push origin master` then finally pushes your plugin to your GitHub
      plugin repository.

That's it!


# Notes

1. in the default setup, the release files inside `editions/release/output`
   won't be under `git` source code control. The rationale is to keep generated
   files out of the manged sources. However, if you want to **keep them
   instead** under `git` control, simply remove the file `.gitignore` in
   `editions/release/`.
