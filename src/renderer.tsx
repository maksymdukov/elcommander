import React from 'react';
import { render } from 'react-dom';
import { registerErrorCtor } from 'elcommander-plugin-sdk';
import * as fsPluginErrors from 'elcommander-plugin-sdk/error/fs-plugin';
import App from './App';
import Providers from './providers';
import './scss/main.scss';

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

Object.keys(fsPluginErrors).forEach((errKey) => {
  // @ts-ignore
  registerErrorCtor(fsPluginErrors[errKey]);
});

render(
  <Providers>
    <App />
  </Providers>,
  document.getElementById('root')
);
