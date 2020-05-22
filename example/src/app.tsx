import '@babel/polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import router from './router';

import '../css/index.less';

ReactDOM.render(router, document.getElementById('app'));
