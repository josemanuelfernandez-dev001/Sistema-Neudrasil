module.exports = {
  appId: 'com.neudrasil.sistema',
  productName: 'Sistema Neudrasil',
  directories: {
    output: 'electron/dist'
  },
  files: [
    'build/**/*',
    'electron/**/*',
    'node_modules/**/*'
  ],
  win: {
    target: 'nsis',
    icon: 'assets/icons/icon.ico'
  },
  mac: {
    target: 'dmg',
    icon: 'assets/icons/icon.icns',
    category: 'public.app-category.medical'
  },
  linux: {
    target: 'AppImage',
    icon: 'assets/icons/icon.png',
    category: 'Science'
  },
  publish: {
    provider: 'github',
    releaseType: 'release'
  }
};
