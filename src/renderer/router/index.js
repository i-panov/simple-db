import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main-page',
      component: require('@/components/MainPage').default
    },
    {
      path: '/edit',
      name: 'edit-page',
      component: require('@/components/EditPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
