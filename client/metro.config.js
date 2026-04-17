const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = ['../shared'];

config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    shared: require('path').resolve(__dirname, '../shared'),
  },
};

module.exports = config;