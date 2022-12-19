# Strapi Plugin: Default Permissions

Easy way to set up all permissions in the code to apply them later in any environment.

This plugin is inspired by the config sync plugin, but I wanted to make permissions more deliberate in the config instead of having them in json files.

The workflow is easy. Set up the permissions you need in the admin as you would normally do, then go to the plugin page and copy the code to your config your `config/plugins.js`.

It's possible to apply them manually in the admin, or automatically using `autoApply: true` in any environment config. Ex: `config/staging/plugins.js` or `config/production/plugins.js`.

It's recommended to use `autoApply: true` in all environments except `development` so you don't override any permissions when (re)starting the strapi application during development.