import Vue from '../../../../dist/wxavue.js';
import router from './routes.js';
import './app.css'

let rootEle = document.createElement('div');
rootEle.setAttribute('id', 'main');
document.body.appendChild(rootEle);

Vue.config.debug = true;//开启错误提示

new Vue({
  router,
  template: `
    <div>
      <router-view></router-view>
    </div>
  `
}).$mount('#main');
