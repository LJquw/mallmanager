<template>
  <el-card class="box-card">
    <!-- 面包屑 -->
    <my-bread level1="权限管理" level2="权限列表"></my-bread>

    <!-- 表格 -->
    <el-table :data="rightList" style="margin: 30px 0" height="377">
      <el-table-column type="index" label="#" width="50">
      </el-table-column>
      <el-table-column prop="authName" label="权限名称">
      </el-table-column>
      <el-table-column prop="path" label="路径">
      </el-table-column>
      <el-table-column label="层级">
        <template slot-scope="scope">
          <!-- 处理级别 -->
          <span v-if="scope.row.level === '0'">一级</span>
          <span v-else-if="scope.row.level === '1'">二级</span>
          <span v-else-if="scope.row.level === '2'">三级</span>
        </template>
      </el-table-column>
    </el-table>

  </el-card>
</template>

<script>
export default {
  name: "Right",
  data(){
    return {
      rightList:[],  // 权限列表数据
    }
  },
  created() {
    this.getRightList()
  },
  methods:{
    // 获取权限列表数据
    async getRightList(){
      const res = await this.$http.get(`rights/list`)
      this.rightList = res.data.data
    }
  }
}
</script>

<style scoped>

</style>
