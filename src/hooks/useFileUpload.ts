// 核心上传逻辑 (切片、并发、Hash)

// 处理文件上传 选定好文件触发的逻辑      ---- 这里包括点击逻辑吗
import type {ChunkItem, UploadFile} from '@/types/file';
import { getHashAndChunk } from '@/utils/getHashAndChunk';
//vite-env.d.ts (解决 worker 报错问题)
import HashWorker from '@/workers/hash.worker.js?worker';//这里是建议传响应式式数据还是 .value呢
import { uploadChunkApi , mergeChunkApi ,checkFileApi} from '@/api/UploadApi/API';

const uploadFiles = async function(files:FileList , uploadFileList: {value: Array<UploadFile>},chunkSize=1 * 1024 * 1024) {
//FileList 是"类数组/可迭代对象"  for of
    Array.from(files).forEach(async (element, i) => {
        const file = element;
        let inTackArrItem: UploadFile = {
            id: Date.now() + i,
            state: 0,
            fileHash: '',
            fileName: file.name,
            fileSize: file.size,
            allChunkList: [], 
            whileUploadingChunkList: [], 
            percentage: 0, 
            finishNumber: 0, 
            errNumber: 0 
        }
        uploadFileList.value.push(inTackArrItem);
        inTackArrItem.state = 1; // 解析中
        // 这里可以调用解析文件的函数，比如生成文件哈希等
        if (file.size === 0) {
            inTackArrItem.state = 4; // 失败
            uploadFileList.value.splice(i, 1);
            return;
        }
        // 计算切片
        // const HashWorkerInstance = new HashWorker();
        // HashWorkerInstance.postMessage({ file, chunkSize });

        const { fileHash, fileChunkList } = await getHashAndChunkWorker(file , chunkSize);

        const checkResult = await checkFileApi(fileHash ,file.name);
        if(checkResult.data?.code === 200 && checkResult.data?.data?.exists) {
            // 文件已存在，直接标记为完成
            inTackArrItem.state = 3; // 上传完
            uploadFileList.value.splice(i, 1);
            console.log('文件已存在，跳过上传:', file.name);
            return;
        }
        // const { fileHash, fileChunkList } = await getHashAndChunk(file , chunkSize=1 * 1024 * 1024);
        // console.log('fileHahs,fileChunkListok', fileHash);

        //拿到文件名-- // 这里要注意！可能同一个文件，是复制出来的，出现文件名不同但是内容相同，导致获取到的hash值也是相同的
        // 所以文件hash要特殊处理         比如 a.txt  b.txt  内容相同  hash值相同
        let baseName = '';
        let lastDotIndex = file.name.lastIndexOf('.');
        if (lastDotIndex !== -1) {
            baseName = file.name.substring(0, lastDotIndex);
        } else {
            baseName = file.name;
        }

        inTackArrItem.fileHash = `${fileHash}${baseName}`;
        // 
        inTackArrItem.state = 2; // 上传中

        //为了保障实现进度条，以及切片需要的信息
        inTackArrItem.allChunkList = fileChunkList.map((chunk, index) => {return {
            fileHash: `${fileHash}${baseName}`,
            
            fileSize: file.size,
            
            fileName: file.name,
            index: index,
            
            chunkFile: chunk.chunkFile,
            
            chunkHash: `${fileHash}-${index}`,
            
            chunkSize: chunk.chunkFile.size,
            
            chunkNumber: fileChunkList.length,
            // 切片是否已经完成
            finish: false,
          }

        });
        console.log('切片列表', inTackArrItem.allChunkList);
        // 开始上传  --- 需要上传文件信息作为对象传入
        uploadSignleFile(inTackArrItem,uploadFileList);
    });
}

function getHashAndChunkWorker(file: File , chunkSize = 1 * 1024 * 1024): Promise<{ fileHash: string; fileChunkList: Array<{ chunkFile: Blob }> }> {
    return new Promise((resolve, reject) => {
        const worker = new HashWorker();
        worker.postMessage({ file, chunkSize });
        worker.onmessage = (e: MessageEvent<{ fileHash: string; fileChunkList: Array<{ chunkFile: Blob }> }>) => {
            resolve(e.data);
            worker.terminate();
        }
    });
}

const uploadSignleFile = async function(uploadFile: UploadFile, uploadFileList: {value: Array<UploadFile>}) {
    console.log('开始上传文件', uploadFile);
    console.log('分片总数:', uploadFile.allChunkList?.length);
    
    if (!uploadFile.allChunkList || uploadFile.allChunkList.length === 0) {
        uploadFile.state = 4; // 失败
        return;
    }

    const allChunkList = uploadFile.allChunkList; // 缓存引用，避免 undefined 检查问题
    const maxConcurrent = 6; // 最大并发数
    let currentIndex = 0; // 当前处理的分片索引
    
    console.log('初始化上传任务，最大并发数:', maxConcurrent, '总分片数:', allChunkList.length);
    
    // 上传单个分片 ---- 并且更新进度
    const uploadChunk = async (chunk: ChunkItem): Promise<void> => {
        try {
            console.log(`开始上传分片 ${chunk.index + 1}/${chunk.chunkNumber}`);
            
            // 创建 FormData
            const formData = new FormData();
            formData.append('file', chunk.chunkFile);  //切片数据
            formData.append('fileHash', chunk.fileHash);
            formData.append('chunkHash', chunk.chunkHash);
            formData.append('fileName', chunk.fileName);
            formData.append('chunkIndex', chunk.index.toString());
            formData.append('chunkNumber', chunk.chunkNumber.toString());

            // 调用后端上传接口
            const response = await uploadChunkApi(formData);
                //// ❌ 注意：不要手动设置 Content-Type！浏览器会自动添加正确的 multipart/form-data 及边界符
                 // "Content-Type": "multipart/form-data" // 错误写法
            
            const result = await response.data || response;
            
            if (result.code !== 200) {
                throw new Error(result.message || '上传失败');
            }
            
            // 标记分片完成
            chunk.finish = true;
            
            // 更新进度（通过在列表中找到对象并更新，确保响应式）
            const uploadItem = uploadFileList.value.find(item => item.fileHash === uploadFile.fileHash);
            if (uploadItem) {
                uploadItem.finishNumber = (uploadItem.finishNumber || 0) + 1;
                uploadItem.percentage = Math.floor((uploadItem.finishNumber / chunk.chunkNumber) * 100);
                console.log(`分片 ${chunk.index + 1} 上传完成，总进度: ${uploadItem.percentage}%`);
            }
        } catch (error) {
            console.error(`分片 ${chunk.index} 上传失败:`, error);
            const uploadItem = uploadFileList.value.find(item => item.fileHash === uploadFile.fileHash);
            if (uploadItem) {
                uploadItem.errNumber = (uploadItem.errNumber || 0) + 1;
            }
            throw error;
        }
    };

    // 并发上传控制
    const uploadNext = async (): Promise<void> => {
        if (currentIndex > allChunkList.length-1) return;      //注意是length
        
        const chunk = allChunkList[currentIndex];       //上传的切片
        currentIndex++;
        
        await uploadChunk(chunk);
        
        // 当前任务完成，继续上传下一个
        return uploadNext();
    };

    try {
        // 启动初始并发任务
        const tasks = [];
        for (let i = 0; i < Math.min(maxConcurrent, allChunkList.length); i++) {
            tasks.push(uploadNext());
        }
        
        // 等待所有任务完成
        //!!!!!!!!!!!!!!!!!!!很重要
        await Promise.all(tasks);
        
        // 检查是否所有分片都上传成功
        const allSuccess = allChunkList.every(chunk => chunk.finish);
        //上传文件hash
        const uploadItem = uploadFileList.value.find(item => item.fileHash === uploadFile.fileHash);
        
        //------------------------------------------------------------------------

        if (allSuccess && uploadFile.errNumber === 0 && uploadItem) {
            console.log('所有分片上传完成，开始合并...');
            
            // 调用合并分片的 API
            try {
                const mergeResponse = await mergeChunkApi(
                    { 'Content-Type': 'application/json' },
                    {
                        fileHash: uploadFile.fileHash,
                        //为什么为name为null
                        fileName: uploadFile.fileName ?? "",
                        // 确认一下后端是叫 fileNumber 还是 chunkCount ?
                        fileNumber: uploadFile.allChunkList.length, 
                    }
                );
                
                // 3. Axios 的返回值通常在 .data 中 (取决于你的拦截器配置)
                // 如果你的 uploadHttp 拦截器已经返回了 response.data，这里直接用 mergeResponse 即可
                const mergeResult = mergeResponse.data || mergeResponse; 
                
                if (mergeResult.code === 200) {
                    uploadItem.state = 3; // 上传完成
                    uploadItem.percentage = 100;
                    console.log('文件上传并合并完成！');
                    
                    // 延迟 1 秒后移除已完成的上传项
                    setTimeout(() => {
                        const index = uploadFileList.value.findIndex(item => item.fileHash === uploadFile.fileHash);
                        if (index !== -1) {
                            uploadFileList.value.splice(index, 1);
                        }
                    }, 1000);
                } else {
                    throw new Error(mergeResult.message || '合并失败');
                }
            } catch (error) {
                console.error('合并分片失败:', error);
                uploadItem.state = 4; // 上传失败
            }
        } else {
            if (uploadItem) {
                uploadItem.state = 4; // 上传失败
            }
            console.error('部分分片上传失败');
        }
    } catch (error) {
        const uploadItem = uploadFileList.value.find(item => item.fileHash === uploadFile.fileHash);
        if (uploadItem) {
            uploadItem.state = 4; // 上传失败
        }
        console.error('上传过程出错:', error);
    }
}

export function useFileUpload() {
    return {
        uploadFiles,
    };
}

