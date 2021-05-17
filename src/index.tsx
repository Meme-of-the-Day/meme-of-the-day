import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import './index.css';
import * as serviceWorker from './serviceWorker';
;(global as any).WebSocket = require('isomorphic-ws');  // Needed to enable web sockets for textile

declare global {
  interface Window {
    ethereum: any;
    web3: any
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
