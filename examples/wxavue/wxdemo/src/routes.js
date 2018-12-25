import Vue from '../../../../dist/wxavue.js';
import Router from 'vue-router';
import wxConfig from './app.json';

var routes = [];
for(var i=0; i<wxConfig.pages.length; i++){
  const page = wxConfig.pages[i];

  routes.push({
    path: '/'+page,
    component: ()=>import(`/${page}.js`)
  });
}

Vue.use(Router);

export default new Router({
  routes: routes
});
