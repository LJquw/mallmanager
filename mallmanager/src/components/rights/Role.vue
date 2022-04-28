<template>
  <el-card class="box-card">
    <!-- 面包屑 -->
    <my-bread level2="角色列表" level1="权限管理"></my-bread>

    <!-- 添加按钮 -->
    <el-row class="addRoleBtn">
      <el-col>
        <el-button type="info" @click="addRoleDia()">添加角色</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="roleList" style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="scope">
          <!-- 无权限 -->
          <div v-if="scope.row.children.length === 0" class="nodata">没有对应权限，请添加</div>
          <!-- 第一级（行） -->
          <el-row v-for="(item1,index1) in scope.row.children" :key="index1">
            <el-col :span="3">
              <el-tag closable class="tags" @close="deleteRoleRight(scope.row,item1.id)">{{item1.authName}}</el-tag>
              <i class="el-icon-arrow-right"></i>
            </el-col>
            <el-col :span="21">
              <!-- 第二级（行） -->
              <el-row v-for="(item2,index2) in item1.children" :key="index2">
                <el-col :span="3">
                  <el-tag closable type="success" class="tags" @close="deleteRoleRight(scope.row,item2.id)">{{item2.authName}}</el-tag>
                  <i class="el-icon-arrow-right"></i>
                </el-col>
                <el-col :span="21">
                  <!-- 第三级（列） -->
                  <el-tag closable type="warning" class="tags"
                          v-for="(item3,index3) in item2.children"
                          :key="index3" @close="deleteRoleRight(scope.row,item3.id)">{{item3.authName}}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <!-- column索引列 只要加上type="index" -->
      <el-table-column type="index" label="#" width="150" ></el-table-column>
      <el-table-column label="角色名称" prop="roleName" width="200"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc" width="200"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <!-- 修改按钮 -->
          <el-button size="mini" plain type="primary" icon="el-icon-edit" circle @click="showEditRightDia(scope.row)"></el-button>
          <!-- 删除按钮 -->
          <el-button size="mini" plain type="danger" icon="el-icon-delete" circle @click="showDeleRightDia(scope.row.id)"></el-button>
          <!-- 分配权限按钮 -->
          <el-button type="success" icon="el-icon-check" size="mini" plain circle @click="showSetRightDia(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 对话框 -->
    <!-- 添加角色对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogAddFormVisible" width="40%">
      <el-form :model="formRoleData" :rules="rules">
        <el-form-item label="角色名称" label-width="120px" prop="roleName">
          <el-input v-model="formRoleData.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" label-width="120px" prop="roleDesc">
          <el-input v-model="formRoleData.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddRights()">确定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogEditFormVisible" width="40%">
      <el-form :model="formRoleData" :rules="rules">
        <el-form-item label="角色名称" label-width="120px" prop="roleName">
          <el-input v-model="formRoleData.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" label-width="120px" prop="roleDesc">
          <el-input v-model="formRoleData.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogEditFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAnsureRole()">确定</el-button>
      </div>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="dialogFormVisibleRights" width="35%">
      <!-- 树状结构 show-checkbox有多选框 :default-checked-keys默认选中 -->
      <el-tree ref="tree" :data="treeRights" show-checkbox node-key="id" :default-expand-all="true"
               :default-checked-keys="defaultCheckeds" :props="defaultProps" >
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleRights = false">取 消</el-button>
        <el-button type="primary" @click="setAddRights()">确 定</el-button>
      </div>
    </el-dialog>

  </el-card>
</template>

<script>
export default {
  name: "Role",
  created(){
    this.getRoleList()
  },
  data(){
    return {
      roleList:[],  // 角色列表数据
      dialogFormVisibleRights: false, // 分配权限对话框
      treeRights: [], // 权限树状列表
      defaultCheckeds: [], // 角色已有的权限
      defaultProps: { // 配置型
        id: 'id',
        label: 'authName',
        children: 'children',
      },
      roleId: 0, // 当前角色ID
      dialogAddFormVisible: false, // 添加角色对话框
      dialogEditFormVisible: false, // 修改角色对话框
      formRoleData:{},  // 角色列表数据
      // 验证规则
      rules: {
        roleName: [{
          required: true,
          message: '请输入角色名称',
          trigger: 'blur'
        },
          {
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
            trigger: 'blur'
          }
        ],
        roleDesc: [{
          required: true,
          message: '请输入角色描述',
          trigger: 'blur'
        }, ],
      },
      // 当前用户id
      currentRoleId: -1,
    }
  },
  methods:{
    // 获取角色权限数据
    async getRoleList(){
      const res = await this.$http.get(`roles`)
      this.roleList = res.data.data
    },
    // 取消角色权限
    deleteRoleRight(role, rightId) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        role.children = res.data.data
        if (res.data.meta.status === 200) {
          this.$message.success(res.data.meta.msg)
        } else {
          this.$message.warning(res.data.meta.msg)
        }
      }).catch(() => {
      });
    },
    // 修改/分配权限 --- 打开对话框
    async showSetRightDia(roles) {
      this.dialogFormVisibleRights = true;
      // 赋值ID
      this.roleId = roles.id
      // 读取已有的权限信息 只需要处理第三级
      roles.children.forEach(item1 => {
        item1.children.forEach(item2 => {
          item2.children.forEach(item3 => {
            this.defaultCheckeds.push(item3.id)
          })
        })
      });

      // 获取树形结构数据
      const res = await this.$http.get(`rights/tree`)
      this.treeRights = res.data.data
    },
    // 修改权限 --- 发送请求
    async setAddRights(){
      // 获取选中的权限
      // 获取被选这个权限的id 全选
      const arr1 = this.$refs.tree.getCheckedKeys()
      // 获取半选中权限的节点的id 半选
      const arr2 = this.$refs.tree.getHalfCheckedKeys()
      // 合并数组
      const arr = [...arr1, ...arr2]
      // 发请求
      const res = await this.$http.post(`roles/${this.roleId}/rights`,{
        rids: arr.join(',')
      })
      if (res.data.meta.status === 200) {
        this.$message.success(res.data.meta.msg)
      } else {
        this.$message.warning(res.data.meta.msg)
      }
      await this.getRoleList()
      this.dialogFormVisibleRights = false;
    },
    // 添加角色  --- 显示对话框
    addRoleDia(){
      this.formRoleData = {}
      this.dialogAddFormVisible = true
    },
    // 点击确定，添加新用户 进行预校验
    async editAddRights(){
      this.dialogAddFormVisible = false
      const res = await this.$http.post(`roles`,this.formRoleData)
      if (res.data.meta.status === 200) {
        this.$message.success(res.data.meta.msg)
      } else {
        this.$message.warning(res.data.meta.msg)
      }
      await this.getRoleList()
    },
    // 编辑角色  --- 显示对话框
    showEditRightDia(roleList){
      this.formRoleData = roleList
      this.currentRoleId = roleList.id
      this.dialogEditFormVisible = true
    },
    // 点击确定,修改用户 进行预校验
    async editAnsureRole(){
      const res =await this.$http.put(`roles/${this.currentRoleId}`,this.formRoleData)
      this.dialogEditFormVisible = false
      if(res.data.meta.status === 200){
        this.$message.success(res.data.meta.msg)
      }else{
        this.$message.warning(res.data.meta.msg)
      }
      await this.getRoleList()
    },
    // 删除用户
    showDeleRightDia(id){
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await this.$http.delete(`roles/${id}`)
        await this.getRoleList()
        if (res.data.meta.status === 200) {
          this.$message.success(res.data.meta.msg)
        } else {
          this.$message.warning(res.data.meta.msg)
        }
      }).catch(() => {
      });
    }
  }
}
</script>

<style scoped>
.addRoleBtn{
  margin-top: 20px;
}
.tags {
  margin: 5px 1px;
}
.nodata {
  text-align: center;
  color: #F56C6C;
}
</style>
