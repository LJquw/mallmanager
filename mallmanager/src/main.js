// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import moment from 'moment'
import App from './App'
import MyBread from "@/components/cuscom/MyBread";    // 是组件选项所在的对象
import MyServerHttp from "@/plugins/http.js"
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router'

// 使用vue插件
Vue.use(ElementUI)
// 使用axios
Vue.use(MyServerHttp)

Vue.config.productionTip = false

// 全局过滤器---处理日期
Vue.filter('fmtdate',(v) => {
  return moment(v).format('YYYY-MM-DD')
})

// 全局自定义组件
Vue.component('my-bread',MyBread)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
