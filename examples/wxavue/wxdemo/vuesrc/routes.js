import Vue from '../../../../dist/wxavue.js';
import Router from 'vue-router';
import home from '../page/component/index.js'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path:'/',
      component: home
    }
  ]
});
