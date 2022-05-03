<template>
  <el-card class="box-card">
    <!-- 面包屑 -->
    <my-bread level1="商品管理" level2="商品列表"></my-bread>

    <!-- 提示添加商品 -->
    <el-alert class="alert" title="添加商品信息" type="success" center show-icon></el-alert>

    <!-- 步骤条 -->
    <el-steps :active="active*1" align-center finish-status="success" class="alert">
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
    </el-steps>

    <!-- 基本信息表单 -->
    <el-form label-position="top" label-width="80px" :model="goodsList" style="height: 298px; overflow: auto;">
      <!-- tabs标签页 -->
      <el-tabs tab-position="left" v-model="active" @tab-click="tabChange()">
        <!-- :before-leave 属性调用方法不能有括号 -->
        <el-tab-pane label="基本信息" name="1">
          <el-form-item label="商品名称">
            <el-input v-model="goodsList.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格">
            <el-input v-model="goodsList.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量">
            <el-input v-model="goodsList.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量">
            <el-input v-model="goodsList.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <el-cascader clearable :options="categorys" @change="handleChange()" v-model="selectOptions" :props="defaultProps"></el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="2">
          <!-- 动态参数 根据分类不同而变化 -->
          <el-form-item v-for="(item1,index1) in goodsDyParams" :key="index1" :label="item1.attr_name">
            <el-checkbox-group v-model="item1.attr_vals">
              <el-checkbox border :label="item2" v-for="(item2,index2) in item1.attr_vals" :key="index2"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="3">
          <!-- 静态参数 -->
          <el-form-item v-for="(item1,index1) in goodsStaticParams" :key="index1" :label="item1.attr_name">
            <el-input v-model="item1.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="4">
          <!-- 文件上传 -->
          <el-upload action="http://175.27.228.178:3434/api/private/v1/upload"
                     list-type="picture" :headers="tokenHeader"
                     :on-success="handleAvatarSuccess" :on-preview="previewAvatarUpload"
                     :on-remove="handleRemove">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="5">
          <el-form-item>
            <el-button type="primary" @click="addGoods()">添加商品</el-button>
            <!-- 此处使用富文本 -->
            <quill-editor v-model="goodsList.goods_introduce"></quill-editor>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>

  </el-card>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'

export default {
  name: "GoodsAdd",
  created() {
    this.getCategoryList()  // 加载分类参数
  },
  data(){
    return {
      active:'1', // 步骤条控制
      //  商品列表数据
      goodsList:{
        goods_name:'',
        goods_number:'',
        goods_price:'',
        goods_weight:'',
        goods_introduce:'',
        goods_cat: '',
        pics: [],
        attrs: []
      },
      categorys: [], // 商品分类
      selectOptions: [ 550, 553, 561], // 选中分类参数 最终选择的label对应的value
      defaultProps: { // 商品分类数据
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      goodsDyParams: [], // 商品动态参数
      goodsStaticParams: [], // 商品静态参数
      tokenHeader: { // 设置上传token
        'Authorization': sessionStorage.getItem('token')
      },
    }
  },
  components: {
    quillEditor
  },
  methods:{
    // 获取商品分类信息数据 -- 三级分类信息
    async getCategoryList(){
      const res = await this.$http.get(`categories?type=3`)
      this.categorys = res.data.data
    },
    // 级联选择器 @change选择触发改变
    handleChange(){
      // 判断分类是否选中
      if (this.selectOptions.length !== 3) {
        this.$message.warning('请先选择商品分类！')
        return false // 阻止跳转
      }
    },
    // 当标签被选中时
    async tabChange(){
      // 商品参数（动态参数） 如果点击的是第二个tab，同时必须三级分类要有值
      if(this.active === '2'){
        if(this.selectOptions.length !== 3){
          // 提示
          this.$message.warning('请先选择商品的三级分类')
          return
        }
        // 获取数据  获取分类 ID
        const res = await this.$http.get(`categories/${this.selectOptions[2]}/attributes?sel=many`)
        this.goodsDyParams = res.data.data
        // 把数组中的每个对象.attr_vals字符串 -》数组
        this.goodsDyParams.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.trim().split(',')
        })
      }else if(this.active === '3'){
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
    // 上传成功处理
    handleAvatarSuccess(file){
      // file.data.tmp_path 图片临时上传的路径
      // 给this.goodsList.pics添加临时路径
      this.goodsList.pics.push({
        pic:file.data.tmp_path
      })
    },
    // 点击图片移除
    handleRemove(file){
      // file.response.data.tmp_path 图片临时上传的路径
      // 在数组中移除图片临时路径
      // 现获取该图片的索引
      // findIndex((item)=>{}) 遍历 把符合条件的元素的索引进行返回
      let index = this.goodsList.pics.findIndex((item) => {
        // item指数组的每个元素
        return item.pic === file.response.data.tmp_path
      })
      this.goodsList.pics.splice(index,1)
      // console.log(this.goodsList.pics)
    },
    // 上传前的验证
    previewAvatarUpload(file){

    },
    // 添加商品 - 发送请求
    addGoods: async function () {
      // goods_cat  -> 分类
      this.goodsList.goods_cat = this.selectOptions.join(',')

      // pics 在上传和移除图片时进行赋值和删除 [].findIndex()

      // 处理商品参数 = 动态 + 静态
      let arr1 = this.goodsDyParams.map(item => {
        let val = item.attr_vals === '' ? '' : item.attr_vals.join(',')
        return {'attr_id': item.attr_id, 'attr_value': val}
      })
      let arr2 = this.goodsStaticParams.map(item => {
        return {'attr_id': item.attr_id, 'attr_value': item.attr_vals}
      })
      this.goodsList.attrs = [...arr1, ...arr2]

      // 在发请求之前 处理this.goodsList中未请求的数据
      const res = await this.$http.post(`goods`, this.goodsList)
      if (res.data.meta.status === 201) {
        this.$message.success(res.data.meta.msg)
        this.goodsList = {}
        // 跳转商品列表
        this.$router.push({name:'goods'})
      }else{
        this.$message.warning(res.data.meta.msg)
      }
      console.log(res)

    }
  }
}
</script>

<style scoped>
.alert{
  margin: 20px 0;
}
.quill-editor{
  margin: 20px 0;
}
</style>
