import axios from "axios";

const request = axios.create({
    timeout: 5000
})
// request 拦截器
request.interceptors.request.use(config => {
    config.headers['Content-Type'] = 'application/json;charset=utf-8';
    return config
}, error => {
    return Promise.reject(error)
});

// response 拦截器
request.interceptors.response.use(
response => {
    let res = response.data;
// 如果是返回的文件
    if (response.config.responseType === 'blob') {
        return res
    }
    //如果返回的是 string ,就转成 json 对象
    if (typeof res === 'string') {
        res = res ? JSON.parse(res) : res
    }
    return res;
},
    error => {
        console.log('err' + error)
        return Promise.reject(error)
    }
)

export default request