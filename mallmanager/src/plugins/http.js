// 使用axios（本身属于第三方库，与vue没有任何关系） 封装成插件
// 引入axios
import axios from 'axios'

// 单独引用message
// import { Message } from 'element-ui'

// 1.定义插件
const MyHttpServer = {}

// 2.开发插件
MyHttpServer.install = (Vue) => {
  // 基准地址设置
  axios.defaults.baseURL='http://175.27.228.178:3434/api/private/v1/'
  // 需要授权的 API ，必须在请求头中使用 `Authorization` 字段提供 `token` 令牌
  // axios.defaults.headers.common['Authorization'] = sessionStorage.getItem('token');

  // 添加请求拦截器（每一次网络请求）
  axios.interceptors.request.use(function (config) {
    if (config.url !== 'login') {
      // console.log(config);
      // 在当前请求下加入Authorization
      config.headers['Authorization'] = sessionStorage.getItem('token')
    }
    // 在发送请求之前做些什么
    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  })

  // 需求：对所以网络请求失败的请求（不是200或201）400，404，500，403 统一处理
  // axios.interceptors.response.use(function (response) {
  //   // 对响应数据做点什么
  //   let {meta:{status,msg}} = response.data
  //   if(status!==200 && status!==201){
  //     Message.error(msg)
  //   }
  //   return response;
  // }, function (error) {
  //   // 对响应错误做点什么
  //   Message.error('服务器正在维护中...')
  //   return Promise.reject(error);
  // });

  // 4. 添加实例方法
  Vue.prototype.$http = axios
}

export default MyHttpServer
