const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Allow Metro to resolve the /shared workspace
config.watchFolders = [path.resolve(__dirname, '../shared')];
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    shared: path.resolve(__dirname, '../shared'),
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
