// 插件模块
import axios from "axios";

const MyHttpServer = {}

MyHttpServer.install = (Vue) => {
  axios.defaults.baseURL='http://175.27.228.178:3434/api/private/v1/'
  // 4. 添加实例方法
  Vue.prototype.$http = axios
}

export default MyHttpServer
