import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/home'
import Maphtml from '@/views/map'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/maphtml',
      name: 'Maphtml',
      component: Maphtml
    }
  ]
})
