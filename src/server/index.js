

const koa = require('koa');
const app = new koa();//实例化
const Router = require('koa-router');
const router = new Router();//实例化一个路由管家
const axios = require('axios');
const bodyParser = require('koa-bodyparser');
const koaBody = require('koa-body').default || require('koa-body');
const fs = require('fs-extra');
const path = require('path');

// 配置上传目录
const UPLOAD_DIR = path.resolve(__dirname, 'uploads'); // 临时分片存储目录
const MERGE_DIR = path.resolve(__dirname, 'files'); // 合并后的文件存储目录

// 确保目录存在
fs.ensureDirSync(UPLOAD_DIR);
fs.ensureDirSync(MERGE_DIR);
// CORS 中间件必须在所有路由之前
app.use(async (ctx, next) => {
  // console.log('请求进来了')
   //设置响应头
   ctx.set('Access-Control-Allow-Origin', '*');
   ctx.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
   ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
   if (ctx.method === 'OPTIONS') {
      ctx.status = 204;
      return;
   }

   await next();
})

// 配置 koa-body 用于文件上传和 JSON 解析（移除 koa-bodyparser，避免冲突）
app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 2000 * 1024 * 1024, // 最大文件大小 2GB
        uploadDir: UPLOAD_DIR, // 上传目录
        keepExtensions: true // 保留文件扩展名
    },
    json: true, // 支持 JSON 解析
    urlencoded: true // 支持 URL 编码解析
}));

// 上传分片接口
router.post('/upload/chunk', async (ctx) => {
    try {
        const { fileHash, chunkHash, fileName, chunkIndex, chunkNumber } = ctx.request.body;
        const file = ctx.request.files.file;

        if (!file) {
            ctx.body = { code: 400, message: '没有接收到文件' };
            return;
        }

        // 创建文件hash目录
        const chunkDir = path.resolve(UPLOAD_DIR, fileHash);
        await fs.ensureDir(chunkDir);

        // 移动分片到指定目录
        const chunkPath = path.resolve(chunkDir, chunkHash);
        await fs.move(file.filepath, chunkPath, { overwrite: true });

        console.log(`分片上传成功: ${chunkHash} (${parseInt(chunkIndex) + 1}/${chunkNumber})`);

        ctx.body = {
            code: 200,
            message: '分片上传成功',
            data: { chunkHash }
        };
    } catch (error) {
        console.error('上传分片失败:', error);
        ctx.body = { code: 500, message: '上传分片失败', error: error.message };
    }
});

// 合并分片接口
router.post('/upload/merge', async (ctx) => {
    try {
        const { fileHash, fileName, chunkNumber } = ctx.request.body;

        if (!fileHash || !fileName) {
            ctx.body = { code: 400, message: '参数错误' };
            return;
        }

        const chunkDir = path.resolve(UPLOAD_DIR, fileHash);
        const filePath = path.resolve(MERGE_DIR, fileName);

        // 检查分片目录是否存在
        const exists = await fs.pathExists(chunkDir);
        if (!exists) {
            ctx.body = { code: 400, message: '分片不存在' };
            return;
        }

        // 读取所有分片
        const chunkFiles = await fs.readdir(chunkDir);
        
        // 按索引排序
        chunkFiles.sort((a, b) => {
            const indexA = parseInt(a.split('-').pop());
            const indexB = parseInt(b.split('-').pop());
            return indexA - indexB;
        });

        // 创建写入流
        const writeStream = fs.createWriteStream(filePath);

        // 依次写入分片
        for (const chunkFile of chunkFiles) {
            const chunkPath = path.resolve(chunkDir, chunkFile);
            const chunkBuffer = await fs.readFile(chunkPath);
            writeStream.write(chunkBuffer);
        }

        writeStream.end();

        // 等待写入完成
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        // 删除分片目录
        await fs.remove(chunkDir);

        console.log(`文件合并完成: ${fileName}`);

        ctx.body = {
            code: 200,
            message: '文件合并成功',
            data: { filePath, fileName }
        };
    } catch (error) {
        console.error('合并分片失败:', error);
        ctx.body = { code: 500, message: '合并分片失败', error: error.message };
    }
});

// 检查文件是否已上传
router.post('/upload/check', async (ctx) => {
    try {
        const { fileHash, fileName } = ctx.request.body;
        
        // 检查文件是否已存在
        const filePath = path.resolve(MERGE_DIR, fileName);
        const fileExists = await fs.pathExists(filePath);
        
        if (fileExists) {
            ctx.body = {
                code: 200,
                message: '文件已存在',
                data: { uploaded: true }
            };
            return;
        }

        // 检查已上传的分片
        const chunkDir = path.resolve(UPLOAD_DIR, fileHash);
        const chunkExists = await fs.pathExists(chunkDir);
        
        if (chunkExists) {
            const uploadedChunks = await fs.readdir(chunkDir);
            ctx.body = {
                code: 200,
                message: '部分分片已上传',
                data: { 
                    uploaded: false, 
                    uploadedChunks: uploadedChunks.map(chunk => chunk.split('-').pop())
                }
            };
        } else {
            ctx.body = {
                code: 200,
                message: '文件未上传',
                data: { uploaded: false, uploadedChunks: [] }
            };
        }
    } catch (error) {
        console.error('检查文件失败:', error);
        ctx.body = { code: 500, message: '检查文件失败', error: error.message };
    }
});

//注册一个路由
//method :post   url : /chatai
//前端axios 向 /chatai 发送post 请求
//后端再向 ollama ：11434/api/chat 发送post 请求
router.post('/chatai',async(ctx)=>{
    //message 前端传过来的数据，指的是提问的内容
    // console.log(ctx.request.body)
    // console.log(ctx.request.body.message)
    const message = ctx.request.body.message;
    const data = {
        model: "deepseek-r1:1.5b", 
        messages: [
            {
                role: "user",
                content: message
            }
        ],
        stream: false
    }
    
    const response = await axios.post("http://localhost:11434/api/chat",data)
                                // .then(res=>{
                                //     //console.log(res)
                                //     // console.log('1:',res.data)
                                //     ctx.body = {
                                //       code:200,
                                //       message:res.data.message.content
                                //   }
                                // })
    ctx.body = {
        code:200,
        message:response.data.message.content
    }
})



app.use(router.routes())
app.listen(3000,()=>{
  console.log('server is running at port 3000')
})
