import React from 'react';
import { render } from 'react-dom';
import Main from './main';
import Providers from '../../providers';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

render(
  <Providers>
    <QueryClientProvider client={queryClient}>
      <Main />
    </QueryClientProvider>
  </Providers>,
  document.getElementById('root')
);
