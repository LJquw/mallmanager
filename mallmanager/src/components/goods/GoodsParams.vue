<template>
  <el-card class="box-card">
    <!-- 面包屑 -->
    <my-bread level1="商品管理" level2="分类参数"></my-bread>

    <!-- 警告 -->
    <el-alert class="top" title="只允许为第三级分类设置参数" type="error" center show-icon>
    </el-alert>

    <!-- 基本信息表单 -->
    <el-form label-position="left" label-width="80px" >
      <!-- 级联选择器 -->
      <el-form-item label="商品分类">
        <el-cascader :show-all-levels="false" clearable :options="categorys" @change="handleChange()" v-model="selectOptions" :props="defaultProps"></el-cascader>
      </el-form-item>
    </el-form>

    <!-- tabs标签  表格 -->
    <el-tabs v-model="active" type="card" @tab-click="handleClick">
      <el-tab-pane label="动态参数" name="1">
        <el-button type="danger" @click="dialogFormVisibleDy = true">设置动态参数</el-button>
        <el-table :data="goodsDyParams" style="width: 100%">
          <el-table-column type="expand" label="#" width="100">
            <template slot-scope="scope">
              <el-tag
                :key="tag"
                v-for="tag in scope.row.attr_vals"
                closable
                :disable-transitions="false"
                @close="handleClose(scope.row,tag)">
                {{tag}}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="inputVisible"
                v-model="inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="attr_name" label="属性名称" width="200">
          </el-table-column>
          <el-table-column label="操作" width="300">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" circle plain @click="handleShowEdit(scope.row)"></el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete" circle plain @click="handleDelete(scope.row.attr_id)"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="静态参数" name="2">
        <el-button type="danger" @click="dialogFormVisibleStatic = true">设置静态参数</el-button>
        <el-table :data="goodsStaticParams" style="width: 100%">
          <el-table-column label="#" type="index" >
          </el-table-column>
          <el-table-column prop="attr_name" label="属性名称" ></el-table-column>
          <el-table-column prop="attr_vals" label="属性值" ></el-table-column>
          <el-table-column label="操作" >
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" circle plain @click="handleShowEdit(scope.row)"></el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete" circle plain @click="handleDelete(scope.row.attr_id)"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 添加或修改动态参数 -->
      <el-dialog :title="(formdata.attr_id==null?'添加':'修改')+'动态参数'" :visible.sync="dialogFormVisibleDy" width="42%" @closed="handleCloseDialog">
        <el-form :model="formdata">
          <el-form-item label="参数名称" label-width="120px">
            <el-input v-model="formdata.attr_name" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="参数属性" label-width="120px">
            <el-row>
              <el-col :span="17">
                <el-input v-model="formdata.attr_vals" autocomplete="off"></el-input>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisibleDy = false">取 消</el-button>
          <el-button type="primary" @click="handleGoodsEdit('many')">确定</el-button>
        </div>
      </el-dialog>

      <!-- 添加或修改静态参数 -->
      <el-dialog :title="(formdata.attr_id==null?'添加':'修改')+'静态参数'" :visible.sync="dialogFormVisibleStatic" width="42%" @closed="handleCloseDialog">
        <el-form :model="formdata">
          <el-form-item label="参数名称" label-width="120px">
            <el-input v-model="formdata.attr_name" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="参数属性" label-width="120px">
            <el-input v-model="formdata.attr_vals" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisibleStatic = false">取 消</el-button>
          <el-button type="primary" @click="handleGoodsEdit('only')">确定</el-button>
        </div>
      </el-dialog>
    </el-tabs>
  </el-card>
</template>

<script>
export default {
  name: "GoodsParams",
  data(){
    return {
      categorys: [], // 商品分类
      selectOptions: [ 550, 553, 561], // 选中分类参数 最终选择的label对应的value
      defaultProps: { // 商品分类数据
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      goodsDyParams: [], // 商品动态参数
      goodsStaticParams: [], // 商品静态参数
      active:'1', // tabs切换
      goodsParamsList:[], // 参数信息列表
      inputVisible: false,  // 标签输入框显示与否
      inputValue: '',  // 标签输入框的数据
      dialogFormVisibleDy: false, // 动态参数
      dialogFormVisibleStatic: false, // 静态参数
      formdata: {}, // 表单对象
    }
  },
  created() {
    this.getCategoryList()
  },
  methods:{
    // 级联选择器改变
    async handleChange(){
      // 判断分类是否选中
      if (this.selectOptions.length === 3) {
        // 获取动态参数
        const res = await this.$http.get(`categories/${this.selectOptions[2]}/attributes?sel=many`)
        this.goodsDyParams = res.data.data
        // 把数组中的每个对象.attr_vals字符串 -》数组
        this.goodsDyParams.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.trim().split(',')
        })
      }
    },
    // 获取商品分类信息数据 -- 三级分类信息
    async getCategoryList(){
      const res = await this.$http.get(`categories?type=3`)
      this.categorys = res.data.data
    },
    // tans切换时触发方法
    async handleClick(){
      // 如果点击的是第二个tabs
      if(this.active === '2'){
        // 静态参数
        if(this.selectOptions.length !== 3){
          // 提示
          this.$message.warning('请先选择商品的三级分类')
          return
        }
        const res1 = await this.$http.get(`categories/${this.selectOptions[2]}/attributes?sel=only`)
        this.goodsStaticParams = res1.data.data
      }
    },
    // 编辑参数信息按钮
     async handleShowEdit(params){
      const res = await this.$http.get(`categories/${this.selectOptions[2]}/attributes/${params.attr_id}`)
       if (res.data.meta.status === 200) {
         this.formdata = res.data.data
         if (params.attr_sel === 'many') {
           this.dialogFormVisibleDy = true
         } else {
           this.dialogFormVisibleStatic = true
         }
       }
    },
    // 关闭对话框
    handleCloseDialog() {
      this.formdata = {}
    },
    // 编辑商品参数
    handleGoodsEdit(type) {
      // 判断是静态还是动态
      let req = null
      if (this.formdata.attr_id != null) {
        // 发送请求
        req = this.$http.put(`categories/${this.selectOptions[2]}/attributes/${this.formdata.attr_id}`, this.formdata)
      } else {
        this.formdata.attr_sel = type // 参数类型
        // 发送请求
        req = this.$http.post(`categories/${this.selectOptions[2]}/attributes`, this.formdata)
      }
      req.then(res => {
        const {data,meta: {msg,status}} = res.data
        if (status === 201 || status === 200) {
          this.handleChange()
          if (type === 'many') {
            this.dialogFormVisibleDy = false
          } else {
            this.dialogFormVisibleStatic = false
          }
          this.$message.success(msg)
        } else {
          this.$message.error(msg)
        }
      }).catch(res => {})
    },
    // 删除参数信息
    handleDelete(id){
      // 弹框询问用户是否删除数据
      this.$confirm('是否删除用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 发送删除的请求
        // 1. 寻找用户id  以参数形式传递进来
        const res = await this.$http.delete(`categories/${this.selectOptions[2]}/attributes/${id}`)
        if(res.data.meta.status === 200){
          // 删除成功提示
          this.$message({
            type: 'success',
            message: res.data.meta.msg
          });
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    //  点击x按钮某个标签
    async handleClose(params,tag) {
      params.attr_vals.splice(params.attr_vals.indexOf(tag), 1);
      // 发送请求
      const res = await this.$http.put(`categories/${this.selectOptions[2]}/attributes/${params.attr_id}`,{
        attr_name:params.attr_name,
        attr_sel:params.attr_sel,
        attr_vals:params.attr_vals.join(',')
      })
    },
    // 点击添加一个标签按钮时触发
    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 在添加新标签输入内容后回车或失焦触发
    async handleInputConfirm(params) {
      let inputValue = this.inputValue;
      if (inputValue) {
        params.attr_vals.push(inputValue);
        // 发送请求
        const res = await this.$http.put(`categories/${this.selectOptions[2]}/attributes/${params.attr_id}`,{
          attr_name:params.attr_name,
          attr_sel:params.attr_sel,
          attr_vals:params.attr_vals.join(',')
        })
      }
      this.inputVisible = false;
      this.inputValue = '';
    },
  }
}
</script>

<style scoped>
.top{
  margin: 20px 0;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
