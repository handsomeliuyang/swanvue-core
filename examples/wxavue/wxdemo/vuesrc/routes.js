import Vue from '../../../../dist/wxavue.js';
import Router from 'vue-router';
import home from '../page/component/index.js'
import wxView from '../page/component/component-pages/wx-view/wx-view.js'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path:'/page/component/index',
      component: home
    },
    {
      path:'/page/component/component-pages/wx-view/wx-view',
      component: wxView
    }
  ]
});
