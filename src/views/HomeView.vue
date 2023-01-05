<template>
  <div >
    <div style="margin: 10px 0">
      <el-button type="primary" @click="add">新增</el-button>
    </div>
    <!-- 搜索-->
    <div style="margin: 10px 0">
      <el-input v-model="search" placeholder=" 请 输 入 关 键 字 " style="width: 20%" clearable></el-input>
      <el-button type="primary" style="margin-left: 5px" @click="list">检索</el-button>
    </div>
    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" sortable></el-table-column>
      <el-table-column prop="info" label="物品信息"></el-table-column>
      <el-table-column prop="contributor" label="贡献者"></el-table-column>
      <el-table-column prop="email" label="电子邮箱"></el-table-column>
      <el-table-column fixed="right" label="操作" width="200">
        <template #default="scope">
          <el-button size="mini" @click="handleEdit(scope.row)" type="primary">编辑</el-button>
          <el-popconfirm
              title="确定删除吗？" @confirm="handleDel(scope.row.id)">
            <template #reference>
              <el-button size="mini" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>


    <el-dialog title="提示" v-model="dialogVisible" width="30%">
      <el-form :model="form" :rules="rules" ref="form" label-width="120px">
        <el-form-item label="物品信息" prop="info">
          <el-input v-model="form.info" style="width: 80%"></el-input>
          {{validMsg.info}}
        </el-form-item>
        <el-form-item label="贡献者" prop="contributor">
          <el-input v-model="form.contributor" style="width: 80%"></el-input>
          {{validMsg.contributor}}
        </el-form-item>
        <el-form-item label="电子邮件" prop="email">
          <el-input v-model="form.email" style="width: 80%"></el-input>
          {{validMsg.email}}
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </span>
      </template>
    </el-dialog>
    <div style="margin: 10px 0">
      <el-pagination
          @size-change="handlePageSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[5,10]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import request from "@/utils/request";

export default {
  name: 'HomeView',
  components: {

  },
  data() {
    return {
      currentPage: 1,
      pageSize: 5,
      total: 10,
      form: {},
      dialogVisible: false,
      search: '',
      tableData: [
      ],
      rules: {
        info: [
          {required: true, message: '请输入物品信息', trigger: 'blur'}
        ],
        contributor: [
          {required: true, message: '请输入贡献者', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入电子邮箱', trigger: 'blur'},
          {pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, message: '请输入正确的地址', trigger: 'blur'}
        ],
      },
      validMsg: {},
    }
  },
  created() {
    this.list()
  },
  methods: {
    add() {
      this.dialogVisible = true
      this.form = {}
      this.$refs['form'].resetFields()
      this.validMsg = {}
    },
    save() {
      if (this.form.id) {
        request.put("/api/update", this.form).then(res => {
          if (res.code === "200") {
            this.$message({
              type: "success",
              message: "更新成功"
            })
          } else {
            this.$message({
              type: "error",
              message: res.msg
            })
          }
          this.list()
          this.dialogVisible = false
        })
      } else {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            request.post("/api/save", this.form).then(res => {
              if (res.code === "200") {
                this.dialogVisible = false
                this.list()
              } else if (res.code === "400") {
                this.validMsg.info = res.data.info
                this.validMsg.contributor = res.data.contributor
                this.validMsg.email = res.data.email
              }
            })
          } else {
            this.$message({
              type: "error",
              message: "验证失败，不提交"
            })
            return false}})
        }
    },
    list() {
      request.get("/api/itemsBySearchPage",{
        params: {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          search: this.search
        }
      }).then(res => {
        this.tableData = res.data.records
        this.total = res.data.total
      })
    },
    handleEdit(row) {
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    handleDel(id) {
      request.delete("/api/del/" + id).then(res => {
        if (res.code === "200") {
          this.$message({
            type: "success",
            message: "删除成功"
          })
        } else {
          this.$message({
            type: "error",
            message: res.msg
          })}
        this.list()
      })
    },
    handlePageSizeChange(pageSize) {
      this.pageSize = pageSize
      this.list()
    },
    //处理当前页变化, 比如点击分页连接,或者 go to 第几页
    handleCurrentChange(pageNum) {
      //处理每页显示多少条记录变化
      this.currentPage = pageNum
      this.list()
    }
  }
}
</script>
