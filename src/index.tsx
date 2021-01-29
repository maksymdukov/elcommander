import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import store from './store/store';
import './scss/main.scss';
import JssThemeProvider from './theme/jss-theme.provider';
import './plugins/manager/plugin-manager';

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

render(
  <Provider store={store}>
    <JssThemeProvider>
      <App />
    </JssThemeProvider>
  </Provider>,
  document.getElementById('root')
);
