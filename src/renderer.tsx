import React from 'react';
import { render } from 'react-dom';
import App from './App';
import './scss/main.scss';
import './plugins/manager/plugin-manager';
import Providers from './providers';

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

render(
  <Providers>
    <App />
  </Providers>,
  document.getElementById('root')
);
