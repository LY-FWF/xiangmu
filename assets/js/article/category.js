$(function() {
    // 定义弹出层的 id (索引)编号
    let index
    const { form } = layui

    // 1. 从服务器获取文章列表数据, 并渲染到页面 (封装成一个函数)
    getCateList()

    function getCateList() {
        // 1.1 发送请求
        axios.get('/my/article/cates').then(res => {
            console.log(res);
            // 1.2 判断请求失败
            if (res.status !== 0) {
                return layer.msg('获取失败!')
            }

            // 1.4 请求成功 TODO
            // 使用模板引擎渲染页面: 1. 引入插件 ; 2. 准备一个模板 ; 3. 调用一个模板函数
            const htmlStr = template('tpl', res)
            console.log(htmlStr);

            // 1.5 把 html 字符串渲染到 tbody 表格主体中
            $('tbody').html(htmlStr)
        })
    }

    // 2. 点击添加按钮,添加一个文章分类
    $('.add-btn').click(function() {
        // 2.1 点完之后,弹出一个弹框
        index = layer.open({
            type: 1,
            // 弹出框标题
            title: '添加文章分类',
            // 弹出框内容
            content: $('.add-form-container'),
            // 弹出框宽高
            area: ['500px', '300px'],

        });
    })

    // 3. 监听添加表单的提交事件
    // 坑 : 注意这个表单点击之后再去添加的,后创建的元素绑定事件统一使用
    $('.add-form').on('submit', function(e) {
        e.preventDefault()

        // 3.1 发送请求,把表单数据提交到服务器
        axios.post('/my/article/addcates', $(this).serialize()).then(res => {
            console.log(res);
            // 3.2 判断请求是否失败
            if (res.status !== 0) {
                return layer.msg('提交失败!')
            }

            // 3.3 成功 TODO,关闭弹出层, index 为定义弹出层位置的返回值
            layer.close(index)

            // 3.4 更新外层分类表格数据,, 重新调用方法渲染即可
            getCateList()
        })

    })

    // 4. 点击编辑按钮,弹出编辑表单
    $(document).on('click', '.edit-btn', function() {
            // console.log(123);

            // 4.1 点完之后,弹出一个弹框
            index = layer.open({
                type: 1,
                // 弹出框标题
                title: '添加文章分类',
                // 弹出框内容
                content: $('.edit-form-container').html(),
                // 弹出框宽高
                area: ['500px', '300px'],

            })

            // 4.2 获取自定义属性的值
            console.log($(this).data('id'));
            const id = $(this).data('id')

            // 4.3  发送请求到服务器,获取当前的分类数据
            axios.get(`/my/article/cates/${id}`).then(res => {
                console.log(res);
                // 4.4 判断失败
                if (res.status !== 0) {
                    return layer.msg('获取失败!')
                }

                // 4.5 对 编辑表单进行赋值
                form.val('edit-form', res.data)

            })


        })
        // 5. 监听编辑表单的提交时间
    $(document).on('submit', '.edit-form', function(e) {
        e.preventDefault()

        // 5.1 发送请求到服务器,提交表单数据
        axios.post('/my/article/updatecate', $(this).serialize()).then(res => {
            console.log(res);
            //判断失败
            if (res.status !== 0) {
                return layer.msg('更新失败!')
            }

            // 5.4 成功 TODO,关闭弹出层, index 为定义弹出层位置的返回值
            layer.close(index)

            // 5.5 更新外层分类表格数据, 重新调用方法渲染即可
            getCateList()
        })
    })

    // 删除
    $(document).on('click', '.del-btn', function() {
        const id = $(this).data('id')
        layer.confirm('确定删除?', { icon: 3, title: '提示' }, function(index) {
            axios.get(`/my/article/deletecate/${id}`)
                .then(res => {
                    console.log(res);
                    if (res.status !== 0) {
                        return layer.msg('删除失败!')
                    }
                    layer.close(index);
                    layer.msg('删除成功')
                    getCateList()
                })
        })
    })

})