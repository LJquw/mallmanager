import Vue from 'vue'
import Router from 'vue-router'
import '@/assets/css/reset.css'
import Login from "@/components/login/Login.vue";
import Home from "@/components/home/Home";
import Users from "@/components/users/Users";
import Right from "@/components/rights/Right";
import Role from "@/components/rights/Role";
import GoodsList from "@/components/goods/GoodsList";
import GoodsAdd from "@/components/goods/GoodsAdd";
import GoodsParams from "@/components/goods/GoodsParams";
import GoodsCate from "@/components/goods/GoodsCate";
import GoodsEdit from "@/components/goods/GoodsEdit";
import {Message} from "element-ui";

Vue.use(Router)

const router = new Router({
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
          name:'rights',
          path:'/rights',
          component:Right
        },
        {
          name:'roles',
          path:'/roles',
          component:Role
        },
        {
          name:'goods',
          path:'/goods',
          component:GoodsList
        },{
          name:'goodsadd',
          path:'/goodsadd',
          component:GoodsAdd
        },{
          name:'params',
          path:'/params',
          component:GoodsParams
        },{
          name:'categories',
          path:'/categories',
          component:GoodsCate
        },{
          name:'goodsedit',
          path:'/goodsedit',
          component:GoodsEdit
        }
      ]
    },
  ]
})

// 在路由生效之前，统一判断token
// 路由守卫 在路由配置生效之前
// 路由/导航 守卫
// 添加路由守卫
router.beforeEach((to, from, next) => {
  // console.log(to, from)
  // 登录请求不验证
  if (to.name === 'login') {
    next()
  } else {
    // 其他情况 必须验证token
    const token = sessionStorage.getItem('token')
    if (!token) {
      router.push({
        'name': 'login'
      }).then(() => {})
      Message.warning('请先登录')
      return
    }
    next()
  }
})

export default router
