import React from 'react';
import ReactDOM from 'react-dom';
import Web3 from 'web3';

import App from './App';
import './index.css';
import * as serviceWorker from './serviceWorker';

declare global {
  interface Window {
    ethereum: any;
    web3: any
  }
}

(async function () {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
  } else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
  } else {
    window.alert('To work correctly, please use metamask!')
  }
})();

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
