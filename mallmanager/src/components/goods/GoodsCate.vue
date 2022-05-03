<template>
  <el-card class="box-card">
    <!-- 面包屑 -->
    <my-bread level1="商品管理" level2="商品分类"></my-bread>

    <!-- 分类按钮 -->
    <el-button type="primary" class="btn" @click="addGoodsCate()">添加分类</el-button>

    <!-- 数据表格 -->
    <el-table :data="categorys"  height="340px" >
      <!-- 树状菜单 prop属性值 label显示标题 treeKey实际值 parentKey父级编号 levelKey当前级别 childKey子节点-->
      <el-tree-grid prop="cat_name" label="分类名称" treeKey="cat_id" parentKey="cat_pid" levelKey="cat_level"
                    childKey="children" :indentSize="30" folderIcon="">
      </el-tree-grid>
      <el-table-column label="级别">
        <template slot-scope="scope">
          <span v-if="scope.row.cat_level === 0">一级</span>
          <span v-if="scope.row.cat_level === 1">二级</span>
          <span v-if="scope.row.cat_level === 2">三级</span>
        </template>
      </el-table-column>
      <el-table-column label="是否有效">
        <template slot-scope="scope">
          {{scope.row.cat_deleted?"无效":"有效"}}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" circle plain @click="handleShowEdit(scope.row)"></el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" circle plain @click="handleDelete(scope.row.cat_id)"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[4, 6, 8, 10]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加商品分类" :visible.sync="dialogFormVisibleAdd" width="42%" @close="handleCloseDialog()">
      <el-form :model="formdata">
        <el-form-item label="分类名称" label-width="120px">
          <el-input v-model="formdata.cat_name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="选择分类" label-width="120px">
          <el-cascader v-model="selectOptions" :options="cateOptions" clearable :props="defaultProps">
          </el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleAdd = false">取 消</el-button>
        <el-button type="primary" @click="handleAdd">添加</el-button>
      </div>
    </el-dialog>

    <!-- 修改商品对话框 -->
    <el-dialog title="修改商品分类" :visible.sync="dialogFormVisibleEdit" width="42%" @close="handleCloseDialog()">
      <el-form :model="formdata">
        <el-form-item label="分类名称" label-width="120px">
          <el-input v-model="formdata.cat_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleEdit = false">取 消</el-button>
        <el-button type="primary" @click="handleEdit">修改</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
let ElTreeGrid = require('element-tree-grid')
export default {
  name: "GoodsCate",
  components:{
    ElTreeGrid
  },
  data(){
    return {
      categorys: [], // 商品分类数据
      cateOptions: [], // 选中分类
      formdata: {}, // 表单对象
      selectOptions: {}, // 选项
      pagenum: 1, // 当前页
      pagesize: 10, // 每页条数
      total: 0, // 总条数
      dialogFormVisibleAdd: false, // 添加对话框
      dialogFormVisibleEdit: false, // 修改对话框
      defaultProps: { // 商品分类数据
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true, // 支持单选
      },
    }
  },
  created() {
    this.getCategories()
  },
  methods:{
    // 获取分类数据
    async getCategories(){
      const res = await this.$http.get(`categories?type=3&pagenum=${this.pagenum}&pagesize=${this.pagesize}`)
      this.categorys = res.data.data.result
      this.pagenum = res.data.data.pagenum
      this.total = res.data.data.total
    },
    // 添加分类按钮  -- 对话框
    async addGoodsCate(){
      const res = await this.$http.get(`categories?type=2`)
      if (res.data.meta.status === 200) {
        this.$message.success(res.data.meta.msg)
        this.cateOptions = res.data.data
      }else{
        this.$message.warning(res.data.meta.msg)
      }
      this.dialogFormVisibleAdd = true
    },
    // 点击确认添加分类
    async handleAdd(){
      if (this.selectOptions.length === 0) {
        // 第一级
        this.formdata.cat_level = 0
        this.formdata.cat_pid = 0
      } else if (this.selectOptions.length === 1) {
        // 第二级
        this.formdata.cat_level = 1
        this.formdata.cat_pid = this.selectOptions[0]
      } else if (this.selectOptions.length === 2) {
        // 第三级
        this.formdata.cat_level = 2
        this.formdata.cat_pid = this.selectOptions[1]
      }
      const res = await this.$http.post(`categories`, this.formdata)
      if (res.data.meta.status === 201) {
        this.$message.success(res.data.meta.msg)
        await this.getCategories()
        this.selectOptions = {}
        this.dialogFormVisibleAdd = false
      }else{
        this.$message.warning(res.data.meta.msg)
      }
    },
    // 表格编辑按钮   -- 对话框
    handleShowEdit(category){
      this.formdata = {
        cat_id: category.cat_id,
        cat_name: category.cat_name
      }
      this.dialogFormVisibleEdit = true
    },
    // 修改数据确认
    async handleEdit(){
      const res = await this.$http.put(`categories/${this.formdata.cat_id}`, this.formdata)
      if (res.data.meta.status === 200) {
        this.$message.success(res.data.meta.msg)
        await this.getCategories()
      }else{
        this.$message.warning(res.data.meta.msg)
      }
      this.dialogFormVisibleEdit = false
    },
    // 表格删除按钮
    async handleDelete(id){
      const res = await this.$http.delete(`categories/${id}`)
      if (res.data.meta.status === 200) {
        this.$message.success(res.data.meta.msg)
        await this.getCategories()
      }else{
        this.$message.warning(res.data.meta.msg)
      }
    },
    // 关闭对话框
    handleCloseDialog() {
      this.formdata = {}
    },
    // 监听 下拉页码 改变的事件 val为选择的条数 选择了几条就把这个作为参数传给数据请求中重新请求
    handleSizeChange(val) {
      this.pagesize=val
      this.getCategories()  // 重新获取数据
    },
    // 监听 页码值 改变的事件 val为选择的页码值 选择了第几页就把这个页码作为参数传给数据请求中重新请求
    handleCurrentChange(val) {
      this.pagenum=val
      this.getCategories()
    },
  }
}
</script>

<style scoped>
.btn{
  margin: 20px 0;
}
</style>
