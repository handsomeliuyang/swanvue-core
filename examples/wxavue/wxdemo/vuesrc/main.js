import Vue from '../../../../dist/wxavue.js';
import router from './routes.js';
import App from './App.js'

let rootEle = document.createElement('div');
rootEle.setAttribute('id', 'main');
document.body.appendChild(rootEle);

Vue.config.debug = true;//开启错误提示

new Vue({
  router,
  render: h=>h(App)
}).$mount('#main');
