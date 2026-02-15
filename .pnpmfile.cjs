/**
 * Strip accidental "postinstall": "patch-package" from rollup before install.
 */
module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg?.name === 'rollup' && pkg?.scripts?.postinstall) {
        if (/patch-package/i.test(String(pkg.scripts.postinstall))) {
          delete pkg.scripts.postinstall;
        }
      }
      return pkg;
    },
  },
};
