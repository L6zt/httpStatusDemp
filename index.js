/* 
  borhter, 看着 http 说明 对应的响应头
  boreher, 看着 node koa 文档进行对应操作
  我很菜
*/
const koa = require('koa')
const $path = require('path')
const fs = require('fs');
const mime = require('mime');
const app = new koa();
let defaultPort = 8080
    // 返回文件内容 buffer
const findAndReturnFile = async(fileName) => {
        return await new Promise((r, j) => {
            fs.readFile(fileName,
                // {encoding: 'utf-8'}, 
                (err, data) => {
                    if (err) {
                        return j(err)
                    } else {
                        r(data)
                    }
                })
        })
    }
    // 获取 gmt 时间戳
const getUtmTimestamp = (date) => new Date(date).toUTCString()
    // 获取文件描述
const findAndReturnFileDesc = async(fileName) => {
    const fd = await new Promise((r, j) => {
        fs.open(fileName, 'r', (err, fd) => {
            if (err) {
                return j(err)
            } else {
                r(fd)
            }
        })
    })
    const stat = await new Promise((r, j) => {
        fs.fstat(fd, (err, stat) => {
            if (err) {
                return j(err)
            }
            r(stat)
            fs.close(fd, (err) => {
                if (err) j(err)
            })
        })
    })
    return stat
}
app.use(async(ctx, next) => {
    await next()
    console.log('do you have little grils?');
})

app.use(async(ctx) => {
    const { response } = ctx;
    let { path } = ctx
    // 事例 模拟重定向 
    if (/^\/301*?/.test(path)) {
        ctx.response.status = 301
        ctx.response.set({
            // 重定向地址
            Location: 'https://baidu.com'
        })
        ctx.body = '耐心等待'
        return
    }
    // 200 --- 模拟koa的静态服务
    if (/assets\/.*/.test(path)) {
        path = path.replace(/^assets\//, '')
        const filePath = $path.join(__dirname, path)
        const fileMime = mime.getType(path.split('.').pop())
        ctx.status = 200
        const { mtime } = await findAndReturnFileDesc(filePath)
        const result = await findAndReturnFile(filePath)
        const { 'if-modified-since': ifModifiedSinceDate } = ctx.headers
        const LastModifiedDate = getUtmTimestamp(mtime);
        // 304
        if (LastModifiedDate === ifModifiedSinceDate) {
            ctx.status = 304
            return
        }
        ctx.set({
            'Content-Type': fileMime,
            'Xserver': 'xBykoa',
            'Last-Modified': LastModifiedDate
        })
        ctx.body = result;
    }
})
const startKoadApp = (port) => new Promise((r, j) => app.listen(port, (err) => {
    if (err) {
        j(prot + 1)
    } else {
        const prefix = `http://localhost:${defaultPort}`
        console.log('***-服务器-***');
        console.log(`${prefix}/301`, '感受301吧')
        console.log(`${prefix}/assets/**.ext`, '感受获取静态资源的服务吧');
        console.log(`${prefix}/assets/index.html`);
        console.log('***--***');
    }
}));
startKoadApp(defaultPort).catch(e => {
    defaultPort++
    startKoadApp(defaultPort)
})