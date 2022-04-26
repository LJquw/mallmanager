<template>
  <el-card class="box-card">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索 -->
    <el-row class="searchRow">
      <el-col>
        <!-- 搜索与添加区域 -->
        <!-- 将value和query双向绑定 点击搜索就发送请求 请求相应的数据 放到userlist里
          如果默认不搜索就是请求所有的数据 同时加上clearble属性 使得点击可以清除输入内容
          于是触发clear事件 监听事件让下面显示所有数据 -->
        <el-input class="inputSearch" placeholder="请输入内容" v-model="query" clearable @clear="loadUserList()">
          <el-button slot="append" icon="el-icon-search" @click="searchUser()"></el-button>
        </el-input>
        <!-- 点击这个按钮 对话框显示出来 -->
        <el-button type="success" @click="showAddUserDia()">添加用户</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="userList" style="width: 100%">
      <!-- 跟menu一样 把要展示的数据存储到table自带的属性data里面 下面再用prop取对应的数据 和v-model双向绑定 -->
      <el-table-column type="index" label="#"></el-table-column> <!-- column索引列 只要加上type="index" -->
      <el-table-column label="姓名" prop="username" width="70px"></el-table-column>
      <el-table-column label="邮箱" prop="email"></el-table-column>
      <el-table-column label="电话" prop="mobile"></el-table-column>
      <el-table-column label="创建时间">
        <!-- slot-scope会自动寻找上一级绑定的数据，并且赋值给scope,所以slot-scope的scope是自己定义的，可以随便取名字 -->
        <template slot-scope="scope">{{scope.row.create_time | fmtdate}}</template>
      </el-table-column>
      <el-table-column label="用户状态" prop="mg_state">
        <template slot-scope="scope">
          <el-switch @change="changeMsgState(scope.row)" v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="#ff4949">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <!-- 修改按钮 -->
          <el-button size="mini" plain type="primary" icon="el-icon-edit" circle @click="showEditUserMsgBox(scope.row)"></el-button>
          <!-- 删除按钮 -->
          <el-button size="mini" plain type="danger" icon="el-icon-delete" circle @click="showDeleUserMsgBox(scope.row.id)"></el-button>
          <!-- 分配角色按钮 -->
          <el-button type="success" icon="el-icon-check" size="mini" plain circle @click="showSetRoleMsgBox(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[2, 4, 6, 8]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <!-- 对话框 -->
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible">
      <el-form :model="addForm" :rules="addFormRules">
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="username">
          <el-input v-model="addForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密 码" :label-width="formLabelWidth" prop="password">
          <el-input v-model="addForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮 箱" :label-width="formLabelWidth" prop="email">
          <el-input v-model="addForm.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="电 话" :label-width="formLabelWidth" prop="mobile">
          <el-input v-model="addForm.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible">
      <el-form :model="addForm" :rules="editFormRules">
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="username">
          <el-input v-model="addForm.username" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮 箱" :label-width="formLabelWidth" prop="email">
          <el-input v-model="addForm.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="电 话" :label-width="formLabelWidth" prop="mobile">
          <el-input v-model="addForm.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" @close="setRoleDialogClosed()">
      <el-form :model="addForm">
        <el-form-item label="当前的用户:" :label-width="formLabelWidth">
          {{userInfo.username}}
        </el-form-item>
        <el-form-item label="当前的角色:" :label-width="formLabelWidth">
          {{userInfo.role_name}}
        </el-form-item>
        <el-form-item label="角色" :label-width="formLabelWidth">
          {{selectedRoleId}}
          <el-select v-model="selectedRoleId">
            <el-option label="请选择" :value="-1"></el-option>
            <!-- :value="item.id"选中的其实是id（都是用的id） 这样v-model是当前选中的value值（即id）
              和selectedRoleId进行绑定（？）当点击确定的时候就将selectedRoleId保存到当前的用户信息中 -->
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveSetRole()">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>

export default {
  name: "Users",
  data(){
    // 验证邮箱的自定义规则（查看element）
    let checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) { /* 校验通过 */
        return cb() /* cb随便取的 组件应该定义好了 */
      }
      cb(new Error('请输入合法的邮箱')) /* 传递一个错误对象 */
    }

    // 验证手机号的自定义规则
    let checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      /**
       * 从头开始第一位是1；
       * 第二位是3,4,5,7,8；
       * 第三位到结尾是0 - 9 的数字
       */
      const regMobile = /^[1][3-5,7-8][0-9]{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }

    return {
      query:'', // 搜索输入
      // 表格数据
      pagenum:1,  // 当前页码
      pagesize:2, // 每页显示条数
      total:0, // 分页总条数
      userList:[],  // 表格绑定数据
      addDialogVisible: false,  // 控制添加用户对话框的显示与隐藏
      addForm: {  // 添加用户的表单数据
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      formLabelWidth: '100px',    // 添加用户对话框宽度
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }, /* 必填项 验证是否输入了用户名 */
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名的长度在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: false, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' } /* 查看element */
        ],
        mobile: [
          { required: false, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          { required: false, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: false, message: '请输入用户手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 修改用户的id
      currentUserId:-1,
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已选中的角色Id值
      selectedRoleId: -1,
    }
  },
  created() {
    this.getUserList()
  },
  methods:{
    // 获取用户列表
    async getUserList(){
      // 需要授权的 API ，必须在请求头中使用 `Authorization` 字段提供 `token` 令牌
      this.$http.defaults.headers.common['Authorization'] = sessionStorage.getItem('token');
      const res = await this.$http.get(`users?query=${this.query}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`)
      const {meta:{status, msg}, data:{users, total}} = res.data
      if(status === 200){
        // 1. 给表格数据赋值
        this.userList=users
        // 2. 给总数赋值
        this.total=total
        // 3. 提示数据获取成功
        this.$message.success(msg)
      }else{
        // 提示
        this.$message.warning(msg)
      }
    },
    // 监听 下拉页码 改变的事件 val为选择的条数 选择了几条就把这个作为参数传给数据请求中重新请求
    handleSizeChange(val) {
      this.pagesize=val
      this.getUserList()  // 重新获取数据
    },
    // 监听 页码值 改变的事件 val为选择的页码值 选择了第几页就把这个页码作为参数传给数据请求中重新请求
    handleCurrentChange(val) {
      this.pagenum=val
      this.getUserList()
    },
    // 点击搜索
    searchUser(){
      // 按照input绑定的query参数发送请求
      this.getUserList()  // 重新请求数据
    },
    // 清空搜索数据
    loadUserList(){
      this.getUserList()
    },
    // 添加用户 --- 显示对话框
    showAddUserDia(){
      this.addForm = {}
      this.addDialogVisible = true
    },
    // 点击确定，添加新用户 进行预校验
    async addUser(){
      // 关闭对话框
      this.addDialogVisible = false
      const res = await this.$http.post(`users`,this.addForm)
      const {meta:{status, msg}, data} = res.data
      if(status === 201){
        // 提示成功
        this.$message.success(msg)
        // 更新视图
        await this.getUserList()
        // 清空文本框
        // this.addForm = {}
        for (const key in this.addForm) {
          if(this.addForm.hasOwnProperty(key)){
            this.addForm[key] = ""
          }
        }
      }else{
        this.$message.warning(msg)
      }
    },
    // 删除用户  -- 打开消息盒子
    showDeleUserMsgBox(userId){
      // 弹框询问用户是否删除数据
        this.$confirm('是否删除用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
          // 发送删除的请求
          // 1. 寻找用户id  以参数形式传递进来
          const res = await this.$http.delete(`users/${userId}`)
          if(res.data.meta.status === 200){
            this.pagenum = 1
            // 更新视图
            await this.getUserList()
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
    // 显示修改用户信息的对话框
    showEditUserMsgBox(userList){
      // 获取用户数据
      this.addForm = userList
      this.currentUserId = userList.id
      this.editDialogVisible = true
    },
    // 点击确认修改用户信息
    async editUser(){
      const res = await this.$http.put(`users/${this.currentUserId}`,this.addForm)
      // 关闭对话框
      this.editDialogVisible = false;
      // 提示信息
      if(res.data.meta.status === 200){
        this.$message.success(res.data.meta.msg)
      }else{
        this.$message.warning(res.data.meta.msg)
      }
      // 更新视图
      await this.getUserList()
    },
    // 修改用户状态
    async changeMsgState(userList) {
      // 发送请求
      const res = await this.$http.put(`users/${userList.id}/state/${userList.mg_state}`)
      // 提示信息
      if(res.data.meta.status === 200){
        this.$message.success(res.data.meta.msg)
      }else{
        this.$message.warning(res.data.meta.msg)
      }
      // 不需要更新视图。因为switch实现了双向数据绑定
    },
    // 分配角色对话框的显示-- 打开对话框
    async showSetRoleMsgBox(userList){
      this.userInfo = userList

      // 发送请求获取角色
      const {data:res} = await this.$http.get(`roles`)
      this.rolesList = res.data

      // 获取当前角色的rid
      const res1 = await this.$http.get(`users/${userList.id}/`)
      this.selectedRoleId = res1.data.data.rid

      this.setRoleDialogVisible = true;
    },
    // 点击确定，分配角色
    async saveSetRole() {
      // 发送请求
      const res = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })

      this.setRoleDialogVisible = false
      if (res.data.meta.status === 200) {
        this.$message.success(res.data.meta.msg);
        await this.getUserList()
      } else {
        this.$message.warning(res.data.meta.msg);
      }
    },
    // 关闭分配角色的对话框 重置 也就是将当前选择项清空 不然下次打开这个对话框还是选择的这个
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
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
</style>
