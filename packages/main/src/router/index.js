import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import SubApp1 from '../views/SubApp1.vue'
import SubApp2 from '../views/SubApp2.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/app/:appId',
    name: 'AppDashboard',
    component: Home
  },
  {
    path: '/sub-app1',
    name: 'SubApp1',
    component: SubApp1
  },
  {
    path: '/sub-app1/*',
    name: 'SubApp1Wildcard',
    component: SubApp1
  },
  {
    path: '/sub-app2',
    name: 'SubApp2',
    component: SubApp2
  },
  {
    path: '/sub-app2/*',
    name: 'SubApp2Wildcard',
    component: SubApp2
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router

