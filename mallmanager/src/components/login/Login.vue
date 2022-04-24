<template>
  <div class="login-wrap">
    <el-form class="login-form" label-position="top" label-width="80px" :model="formdata">
      <h2>用户登录</h2>
      <el-form-item label="用户名">
        <el-input placeholder="请输入用户名" v-model="formdata.username"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="formdata.password" placeholder="请输入密码" show-password></el-input>
      </el-form-item>
      <el-button class="login-btn" type="primary" @click.prevent="handleLogin">登录</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      formdata:{
        name:'',
        password:''
      }
    }
  },
  methods: {
    // 登录请求
    async handleLogin(){
      // async+await  同步
      const res = await this.$http.post('login',this.formdata)
      const {data, meta:{msg, status}} = res.data
      if(status === 200){
        // 登录成功后:
        // 1. 将登录成功之后的 token，保存到客户端的 sessionStorage 中 之后的网络请求中要拿这个token放入请求头中
        //   1.1 项目中除了登录之外的其他API接口，必须在登录之后才能访问 token就是登录令牌
        //   1.2 token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中（不是localstorage）
        window.sessionStorage.setItem('token', data.token)
        // 2. 通过编程式导航跳转到后台主页，路由地址是 /home 但是如果没有拿到token而直接输入地址也不应该跳转
        // 此时要用导航守卫 如果要跳转的是登录页面则直接放行 如果跳转的是其他页面则要判断是否携带token 导航守卫写在router.js里面
        this.$router.push({name:'home'})
        // 3. 提示消息
        this.$message.success(msg)
      }else{
        // 登录失败
        // 提示信息
        this.$message.warning(msg)
      }

      // 异步操作
      // this.$http.post('login',this.formdata).then(res => {
      //   const {data, meta:{msg, status}} = res.data
      //   if(status === 200){
      //     // 登录成功
      //     // 1. 跳转home页面
      //     this.$router.push({name:'home'})
      //     // 2. 提示成功
      //     this.$message.success(msg)
      //   }else{
      //     // 登录失败
      //     // 提示信息
      //     this.$message.warning(msg)
      //   }
      // })
    }
  }
}
</script>

<style scoped>
  .login-wrap {
    height: 100%;
    background-color: #324152;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .login-wrap .login-form {
    background-color: #fff;
    width: 400px;
    padding: 30px;
    border-radius: 5px;
  }

  .login-wrap .login-form .login-btn {
    width: 100%;
  }
</style>
