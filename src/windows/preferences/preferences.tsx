import React from 'react';
import { render } from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Main from './main';
import Providers from '../../providers';
import '../../App.global.css';

const queryClient = new QueryClient();

render(
  <Providers>
    <QueryClientProvider client={queryClient}>
      <Main />
    </QueryClientProvider>
  </Providers>,
  document.getElementById('root')
);
