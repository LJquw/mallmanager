import Vue from 'vue'
import Router from 'vue-router'
import '@/assets/css/reset.css'
import Login from "@/components/login/Login.vue";
import Home from "@/components/home/Home";
import Users from "@/components/users/Users";
import Right from "@/components/rights/Right";
import Role from "@/components/rights/Role";

Vue.use(Router)

export default new Router({
  routes: [
    {
      name:'login',
      path: '/login',
      component:Login
    },{
      name:'home',
      path:'/',
      component:Home,
      children:[
        {
          name:'users',
          path:'users',
          component:Users
        },
        {
          name:'right',
          path:'right',
          component:Right
        },
        {
          name:'role',
          path:'role',
          component:Role
        }
      ]
    },
  ]
})
