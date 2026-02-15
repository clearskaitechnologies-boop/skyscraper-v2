/**
 * PNPM manifest hook to sanitize dependency manifests before installation.
 * We strip any accidental "postinstall": "patch-package" from rollup (and friends).
 */
module.exports = {
  hooks: {
    readPackage(pkg) {
      try {
        // Defensive: nuke postinstall that calls patch-package in rollup
        if (pkg.name === 'rollup' && pkg.scripts && typeof pkg.scripts.postinstall === 'string') {
          // Only remove if it mentions patch-package to avoid changing legit scripts
          if (/patch-package/i.test(pkg.scripts.postinstall)) {
            delete pkg.scripts.postinstall;
          }
        }

        // If any other deps got polluted similarly, list them here:
        // if (['some-dep', 'another-dep'].includes(pkg.name) && pkg.scripts) {
        //   delete pkg.scripts.postinstall;
        // }

      } catch (_) {}
      return pkg;
    },
  },
};
