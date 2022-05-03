<template>
  <el-card class="box-card">
    <!-- 面包屑 -->
    <my-bread level1="商品管理" level2="商品列表"></my-bread>

    <!-- 搜索 -->
    <el-row class="searchRow">
      <el-col>
        <!-- 搜索与添加区域 -->
        <!-- 将value和query双向绑定 点击搜索就发送请求 请求相应的数据 放到userlist里
          如果默认不搜索就是请求所有的数据 同时加上clearble属性 使得点击可以清除输入内容
          于是触发clear事件 监听事件让下面显示所有数据 -->
        <el-input class="inputSearch" placeholder="请输入内容" v-model="query" clearable @clear="loadUserList()">
          <el-button slot="append" icon="el-icon-search" @click="handleSearch()"></el-button>
        </el-input>
        <!-- 点击这个按钮 对话框显示出来 -->
        <el-button type="success" @click="$router.push({name:'goodsadd'})" plain>添加商品</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="goodsList" border style="width: 100%" height="310" class="el-table">
      <el-table-column type="index" label="#" width="50">
      </el-table-column>
      <el-table-column prop="goods_name" label="商品名称">
      </el-table-column>
      <el-table-column prop="goods_price" label="商品价格（元）" width="120">
      </el-table-column>
      <el-table-column prop="goods_weight" label="商品重量" width="100">
      </el-table-column>
      <el-table-column label="创建日期" width="170">
        <!-- 日期处理 -->
        <template slot-scope="scope">
          {{scope.row.add_time|fmtdate}}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" circle plain @click="handleShowEdit(scope.row.goods_id)"></el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" circle plain @click="handleDelete(scope.row.goods_id)"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </el-card>
</template>

<script>
export default {
  name: "GoodsList",
  created() {
    this.getGoodsList()
  },
  data(){
    return {
      goodsList:[], // 商品数据
      pagenum:1,  // 当前页码
      pagesize:5, // 每页显示条数
      total:0, // 分页总条数
      query:'', // 搜索输入
    }
  },
  methods:{
    // 获取商品列表数据
    async getGoodsList(){
      const res = await this.$http.get(`goods?query=${this.query}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`)
      if(res.data.meta.status === 200){
        this.goodsList = res.data.data.goods
        this.pagenum =+ res.data.data.pagenum
        this.total = res.data.data.total
      }else{
        this.$message.warning(res.data.meta.msg)
      }
    },
    // 清空搜索数据
    loadUserList(){
      this.getGoodsList()
    },
    // 点击搜索框搜索
    handleSearch(){
      this.getGoodsList()
    },
    // 监听 下拉页码 改变的事件 val为选择的条数 选择了几条就把这个作为参数传给数据请求中重新请求
    handleSizeChange(val) {
      this.pagesize=val
      this.getGoodsList()  // 重新获取数据
    },
    // 监听 页码值 改变的事件 val为选择的页码值 选择了第几页就把这个页码作为参数传给数据请求中重新请求
    handleCurrentChange(val) {
      this.pagenum=val
      this.getGoodsList()
    },
    // 跳转页面修改
    handleShowEdit(id){
      this.$router.push({name:'goodsedit',params:{id:id}})
    },
    // 删除商品数据
    handleDelete(id){
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await this.$http.delete(`goods/${id}`)
        if(res.data.meta.status === 200){
          this.$message.success(res.data.meta.msg)
          await this.getGoodsList()
        }else{
          this.$message.warning(res.data.meta.msg)
        }
      }).catch(() => {});
    }
  }
}
</script>

<style scoped>
.box-card{
  height: 100%;
}
.searchRow{
  margin-top: 20px;
}
.inputSearch{
  width: 300px;
}
.pagination {
  text-align: center;
  margin: 30px 0;
}
.el-table{
  margin: 20px 0;
}
</style>
