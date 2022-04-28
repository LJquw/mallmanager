<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item>首页</el-breadcrumb-item>
    <el-breadcrumb-item>{{level1}}</el-breadcrumb-item>
    <el-breadcrumb-item>{{level2}}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
export default {
  name: "MyBread",
  // props 值字符串数组 使用用法与data一样
  // props中的值来源于使用组件时通过传值
  props:['level1','level2']
}
</script>

<style scoped>

</style>
