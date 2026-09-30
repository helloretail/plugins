### Changed

- The plugin is renamed from `hello-retail-unmanaged` to `hello-retail-rest-api` and now shows as
  "Hello Retail (REST API)"; its skills are invoked as `/hello-retail-rest-api:<skill>`.
  Existing installs stop updating: uninstall `hello-retail-unmanaged@helloretail`, then run
  `/plugin install hello-retail-rest-api@helloretail` (and update `enabledPlugins` if you set it
  in `settings.json`).
