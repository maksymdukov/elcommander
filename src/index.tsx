import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import store from './store/store';
import './scss/main.scss';
import JssThemeProvider from './theme/jss-theme.provider';

render(
  <Provider store={store}>
    <JssThemeProvider>
      <App />
    </JssThemeProvider>
  </Provider>,
  document.getElementById('root')
);
