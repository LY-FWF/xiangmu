$(function() {
    const { form, laypage } = layui

    //定义一个全局的变量
    let state = ''
        //1.从服务器获取文章的分类列表

    getCatelist()

    function getCatelist() {
        //1.2发送请求
        axios.get('/my/article/cates').then(res => {
            //1.3判断失败
            if (res.status !== 0) {
                return layer.msg('获取失败!')
            }
            //1.4遍历数组,渲染下拉组件的选项
            res.data.forEach(item => {
                $('#cate-sel').append(`<option value="${item.Id}">${item.name}</option>`)
            });
            //1.5 坑:动态创建的表单元素响需要手动创建
            form.render('select')
        })
    }

    // 2. 定义一个查询对象
    const query = {
        pagenum: 1, // 表示当前的页码值,第几页
        pagesize: 2, // 表示每页显示的数据条数
        cate_id: '', // 表示文章的分类 ID
        state: '' // 表示文章的状态
    }

    // 3. 发送请求到服务器,获取文章列表数据
    axios.get('/my/article/list', { params: query }).then(res => {
        console.log(res);
        //判断请求失败
        if (res.status !== 0) {
            return layer.msg('获取失败!')
        }

        // 调用模板函数之前去注册过滤器
        template.defaults.imports.dateFormat = function(date, format) {
            return moment(date).format('YYYY-MM-DD HH:mm:ss')
        };

        // 3.2 使用模板引擎来渲染
        const htmlStr = template('tpl', res)
        console.log(htmlStr);

        // 3.3 添加到 tbody 中
        $('tbody').html(htmlStr)

        // 3.4 渲染分页器
        renderPage(res.total)
    })

    // 4. 把服务器获取的数据,渲染成分页器
    function renderPage(total) {
        laypage.render({
            elem: 'pagination', //注意: 这里是分页器的 ID ,不要加 #
            count: total, //数据总数,从服务端得到
            limit: query.pagesize, //每页显示的数量
            limits: [2, 3, 4, 5], //每页的数据条数
            curr: query.pugenum, //当前的页码值
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'], //分页器的布局排版
            // 切换分页回调函数
            jump: function(obj, first) {
                // obj  包含了当前分页的所有参数,比如
                console.log(obj.curr);
                console.log(obj.limit);
                // 4.2 修改查询对象的参数
                query.pagenum = obj.curr //得到当前页,以便向服务端得到对应页的数据
                query.pagesize = obj.limit //得到当前每页的数据条数

                // 首次不执行
                if (!first) {
                    // 4.3 非首次进入页面,需要重新渲染表格数据
                    getCatelist()
                }
            }
        })
    }

    // 5. 表单筛选功能
    $('.layui-form').submit(function(e) {
        e.preventDefault()

        // 5.1 获取下拉选择框的分类 id 和状态 this.serialize()
        const cata_id = $('#cate-sel').val()
        const state = $('#state').val()
        console.log(cata_id, state);

        // 5.2 把获取到的值重新赋值给 query 对象
        query.cata_id = cata_id
        query.state = state

        // 发送请求之前去修改页码值为第一页 1
        query.pagenum = 1



        // 5.3 重新调用下渲染表格的方法 renderTable()
        getCatelist()
    })

    // 6. 点击删除按钮,删除当前的文章
    $(document).on('click', '.delbtn', function() {
        // 6.1 获取自定义属性值
        const id = $(this).data('id')
        console.log(id);

        // 6.2 弹出一个询问框
        layer.confirm('确认删除?', { icon: 3, title: '提示' }, function(index) {
            // 6.3 发送请求到服务器,删除这条文章
            axios.get(`/my/article/delete/${id}`).then(res => {
                    console.log(res);
                    // 6.4 判断请求失败
                    if (res.status !== 0) {
                        return layer.msg('删除失败!')
                    }
                    // 6.5 提示成功
                    layer.msg('删除成功!')

                    // 7. 填坑处理: 当前页只有一条数据且不处在第一页的时候,那我们点击删除之后,应该去手动更新上一页的数据
                    if ($('.del-btn').length == 1 && query.pagenum !== 1) {
                        query.pagenum = query.pagenum - 1
                    }
                    // 6.6 重新渲染表格
                    renderTable()
                })
                // 关闭弹出层
            layer.close(index)
        })
    })

    // 7. 点击编辑按钮,跳转到文章编辑页面
    $(document).on('click', '.edit-btn', function() {
        // 获取当前文章 id
        const id = $(this).data('id')

        // 如何在两个页面之间进行数据传递: 使用查询参数 ?name=tom&age=10
        // 把当前编辑的文章 id 传入到 编辑页面
        location.href = `./edit.html?id=${id}`

        // 左边导航条更新,自动触发发布文章链接的点击事件
        window.parent.$('.layui-this').next().find('a').click()
    })
})