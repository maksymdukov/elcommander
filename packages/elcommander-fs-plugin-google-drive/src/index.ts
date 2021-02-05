module.exports = () => {
  // eslint-disable-next-line global-require
  const plugin = require('./google-drive-plugin');
  return plugin.GoogleDrivePlugin;
};
