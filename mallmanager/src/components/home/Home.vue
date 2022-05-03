<template>
  <el-container class="container">
    <el-aside :style="{ width: [isCollapse ? asideWidth[1] : asideWidth[0]] + 'px' }"
              class="aside" :collapse="isCollapse">
      <div class="aside-title">
        <h3>{{isCollapse?'':asideTitle}}</h3>
      </div>
      <!-- 导航栏 -->
      <el-menu
        :router="true"
        :unique-opened="true"
        @open="handleOpen"
        @close="handleClose"
        :collapse="isCollapse">
        <el-submenu :index="''+item1.order" v-for="(item1,index1) in menuList" :key="index1">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span>{{item1.authName}}</span>
          </template>
          <el-menu-item :index="item2.path" v-for="(item2,index2) in item1.children" :key="index2">
            <i class="el-icon-menu"></i>
            <span>{{item2.authName}}</span>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <el-row>
          <el-col :span="4" class="left">
            <div class="grid-content bg-purple" @click="collapseChange">
              <i :class="[ isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold' ]" ></i>
            </div>
          </el-col>
          <el-col :span="20" class="loginout">
            <div class="grid-content bg-purple">
              <a href="#" @click.prevent="handleSignout()">退出</a>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-main class="main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  // 进入首页的权限验证
  beforeCreate() {
    // 获取token
    const token = sessionStorage.getItem('token')
    if(!token){
      // 没有-》登录
      this.$router.push({name:'login'})
    }else{
      // 有-》渲染组件
    }
  },

  name: "Home",
  data(){
    return {
      isCollapse:false,  // 侧边栏是否折叠
      asideWidth: [200, 50], //侧边栏展开和收起宽度
      asideTitle:'电商后台管理系统',  // 用户标题
      menuList:[],  // 导航列表
    }
  },
  created() {
    this.getMenus()
  },
  methods:{
    // 侧边栏折叠
    collapseChange() {
      this.isCollapse = !this.isCollapse;
    },
    //侧边栏菜单展开和收起
    handleOpen(key, keyPath) {
      // console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      // console.log(key, keyPath);
    },
    // 退出操作
    handleSignout(){
      // 清除token
      sessionStorage.clear()
      // 提示
      this.$message.success('退出成功')
      // 来到登录页面
      this.$router.push({name:'login'})
    },
    // 获取导航数据
    async getMenus(){
      const res = await this.$http.get(`menus`)
      this.menuList = res.data.data
    }
  }
}
</script>

<style scoped>
/*布局样式*/
.header{
  background-color: #b3c0d1;
}
.aside {
  background-color: #d3dce6;
}
.main {
  background-color: #e9eef3;
}
.container {
  height: 100%;
}

/*头部样式*/
.left{
  line-height: 60px;
}
.loginout{
  text-align: right;
  line-height: 60px;
}
.loginout a{
  text-decoration: none;
}

/*侧边栏样式*/
.aside-title{
  height: 41px;
  text-align: center;
}
</style>
