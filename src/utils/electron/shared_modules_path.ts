// Set NODE_PATH and reload internal node paths
// so that plugins can require 'global' packages (ex. react)
const nmPath = `${__dirname}/node_modules`;

process.env.NODE_PATH = process.env.NODE_PATH
  ? `${process.env.NODE_PATH};${nmPath}`
  : nmPath;

const Module = require('module');

// eslint-disable-next-line no-underscore-dangle
Module.Module._initPaths();
