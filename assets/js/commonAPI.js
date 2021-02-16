//为全局的axios请求设置根路径
axios.defaults.baseURL = 'http://ajax.frontend.itheima.net'

// 添加全局请求拦截器
axios.interceptors.request.use(function(config) {
    console.log('----发送 axjax请求前', config);

    //获取本地存储的token令牌
    const token = localStorage.getItem('token') || ''

    //在发送请求之前判断是否有/my开头的请求路径

    //方法一:startswhith
    //方法二:正则表达式/^\/my

    if (config.url.startsWith('/my')) {
        config.headers.Authorization = token
    }
    // 在发送请求之前做些什么
    return config;
}, function(error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function(response) {
        console.log('----接受 axajx响应前', response);
        const { message, status } = response.data;
        //先判断身份验证是否成功
        if (message == '身份认证失败！' && status == 1) {
            //清除本地存储
            localStorage.removeItem('token');
            //跳转登录页
            location.href = './login.html'
        }


        // 对响应数据做点什么
        return response.data;
    },
    function(error) {
        // 对响应错误做点什么
        return Promise.reject(error);
    });