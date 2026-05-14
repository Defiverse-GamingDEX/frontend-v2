module.exports = {
  hooks: {
    readPackage(pkg) {
      // Force all @intlify packages to stable versions
      if (pkg.dependencies && pkg.dependencies['@intlify/shared']) {
        pkg.dependencies['@intlify/shared'] = '9.9.1';
      }
      if (pkg.dependencies && pkg.dependencies['@intlify/message-compiler']) {
        pkg.dependencies['@intlify/message-compiler'] = '9.9.1';
      }
      if (pkg.dependencies && pkg.dependencies['@intlify/core-base']) {
        pkg.dependencies['@intlify/core-base'] = '9.9.1';
      }
      if (pkg.dependencies && pkg.dependencies['@intlify/bundle-utils']) {
        pkg.dependencies['@intlify/bundle-utils'] = '3.4.0';
      }
      
      // Also check devDependencies
      if (pkg.devDependencies) {
        if (pkg.devDependencies['@intlify/shared']) pkg.devDependencies['@intlify/shared'] = '9.9.1';
        if (pkg.devDependencies['@intlify/message-compiler']) pkg.devDependencies['@intlify/message-compiler'] = '9.9.1';
        if (pkg.devDependencies['@intlify/core-base']) pkg.devDependencies['@intlify/core-base'] = '9.9.1';
        if (pkg.devDependencies['@intlify/bundle-utils']) pkg.devDependencies['@intlify/bundle-utils'] = '3.4.0';
      }

      return pkg;
    }
  }
};
