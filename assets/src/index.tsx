import React from 'react';
import ReactDOM from 'react-dom';
import '@fontsource/comic-mono/400.css';
import '@fontsource/comic-mono/700.css';
import {BrowserRouter} from 'react-router-dom';

import {AuthProvider} from 'src/components/auth/AuthProvider';
import {GlobalProvider} from 'src/components/global/GlobalProvider';
import App from './App';
import reportWebVitals from './reportWebVitals';

import 'src/css/main.css';
import 'src/css/editor.css';

ReactDOM.render(
  <React.StrictMode>
    <GlobalProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </GlobalProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
