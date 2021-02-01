import React from 'react';
import { Provider as StoreProvider } from 'react-redux';
import store from './store/store';
import JssThemeProvider from './theme/jss-theme.provider';
import TreeDndProvider from './views/tree-view/context/tree-dnd.provider';

const Providers: React.FC = ({ children }) => {
  return (
    <StoreProvider store={store}>
      <JssThemeProvider>
        <TreeDndProvider>{children}</TreeDndProvider>
      </JssThemeProvider>
    </StoreProvider>
  );
};

export default Providers;
