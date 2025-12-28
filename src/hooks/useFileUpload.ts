// 核心上传逻辑 (切片、并发、Hash)

// 处理文件上传 选定好文件触发的逻辑      ---- 这里包括点击逻辑吗
import type { ChunkItem, UploadFile } from '@/types/file';
import { getHashAndChunk } from '@/utils/getHashAndChunk';
//vite-env.d.ts (解决 worker 报错问题)
import HashWorker from '@/workers/hash.worker.js?worker';//这里是建议传响应式式数据还是 .value呢
import { uploadChunkApi, mergeChunkApi, checkFileApi } from '@/api/UploadApi/API';
const abortControllers = new Map<string, AbortController>();


const uploadFiles = async function (files: FileList, uploadFileList: { value: Array<UploadFile> }, chunkSize = 1 * 1024 * 1024) {
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

        const { fileHash, fileChunkList } = await getHashAndChunkWorker(file, chunkSize);
        console.log('fileHahs,fileChunkListok', fileHash, file.name)

        
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

        // ✅ 使用拼接后的完整 hash
        const fullFileHash = `${fileHash}${baseName}`;
        inTackArrItem.fileHash = fullFileHash;



        // inTackArrItem.state = 2; // 上传中  -------- 一定要修改响应式数据啊！！！
        uploadFileList.value[i].state = 2; // 上传中






        const checkFileOrGetUploadedChunk = async function (fullHash: string, fileName: string) {
            //name用来处理秒传
            //hash用来处理断点续传
            const checkResult = await checkFileApi(fullHash, fileName);
            console.log('检查文件结果', checkResult);
            if (checkResult.data?.code === 200 && checkResult.data?.data?.uploaded) {
                // 文件已存在，直接标记为完成
                inTackArrItem.state = 3; // 上传完
                uploadFileList.value.splice(i, 1);
                console.log('文件已存在，跳过上传:', file.name);
                return true;
            }
            else {
                // ✅ 返回已上传分片索引数组
                return checkResult.data?.data?.uploadedChunks || [];
            }
        }
        // ✅ 传入完整的 hash
        const checkResult = await checkFileOrGetUploadedChunk(fullFileHash, file.name);

        if (checkResult === true) {
            return;
        }

        console.log(checkResult, '断点续传数组--------------------------')

        //为了保障实现进度条，以及切片需要的信息
        inTackArrItem.allChunkList = fileChunkList.map((chunk, index) => {
            // ✅ 检查当前分片是否已上传
            const isUploaded = checkResult.includes(index.toString());
            if (isUploaded) {
                inTackArrItem.finishNumber = (inTackArrItem.finishNumber || 0) + 1;
            }

            return {
                fileHash: fullFileHash, // ✅ 使用完整的 hash
                fileSize: file.size,
                fileName: file.name,
                index: index,
                chunkFile: chunk.chunkFile,
                chunkHash: `${fileHash}-${index}`,
                chunkSize: chunk.chunkFile.size,
                chunkNumber: fileChunkList.length,
                finish: isUploaded, // ✅ 标记已上传
            }
        });

        // ✅ 更新初始进度
        inTackArrItem.percentage = Math.floor(((inTackArrItem.finishNumber || 0) / inTackArrItem.allChunkList.length) * 100);
        console.log('切片列表', inTackArrItem.allChunkList);
        // 开始上传  --- 需要上传文件信息作为对象传入

        

        uploadSignleFile(inTackArrItem, uploadFileList);
    });
}

function getHashAndChunkWorker(file: File, chunkSize = 1 * 1024 * 1024): Promise<{ fileHash: string; fileChunkList: Array<{ chunkFile: Blob }> }> {
    return new Promise((resolve, reject) => {
        const worker = new HashWorker();
        worker.postMessage({ file, chunkSize });
        worker.onmessage = (e: MessageEvent<{ fileHash: string; fileChunkList: Array<{ chunkFile: Blob }> }>) => {
            resolve(e.data);
            worker.terminate();
        }
    });
}

//独立函数。那么uploadfilelist就必须要传了
const uploadSignleFile = async function (uploadFile: UploadFile, uploadFileList: { value: Array<UploadFile> }) {

    const abortController = new AbortController();
    abortControllers.set(uploadFile.fileHash, abortController);
    console.log('开始上传文件', uploadFile);
    console.log('分片总数:', uploadFile.allChunkList?.length);

    if (!uploadFile.allChunkList || uploadFile.allChunkList.length === 0) {
        uploadFile.state = 4; // 失败
        return;
    }

    // ✅ 断点续传：检查已上传的分片
    try {
        const checkResult = await checkFileApi(uploadFile.fileHash, uploadFile.fileName ?? "");
        if (checkResult.data?.code === 200) {
            const data = checkResult.data.data;
            
            // 如果文件已完全上传，直接标记完成
            if (data?.uploaded) {
                uploadFile.state = 3;
                uploadFile.percentage = 100;
                console.log('文件已存在，跳过上传:', uploadFile.fileName);
                setTimeout(() => {
                    const index = uploadFileList.value.findIndex(item => item.fileHash === uploadFile.fileHash);
                    if (index !== -1) {
                        uploadFileList.value.splice(index, 1);
                    }
                }, 1000);
                return;
            }

            // 标记已上传的分片
            const uploadedChunks = data?.uploadedChunks || [];
            uploadFile.allChunkList.forEach(chunk => {
                if (uploadedChunks.includes(chunk.index.toString())) {
                    chunk.finish = true;
                    uploadFile.finishNumber = (uploadFile.finishNumber || 0) + 1;
                }
            });
            
            uploadFile.percentage = Math.floor(((uploadFile.finishNumber || 0) / uploadFile.allChunkList.length) * 100);
            console.log(`断点续传：发现 ${uploadedChunks.length} 个已上传分片，当前进度: ${uploadFile.percentage}%`);
        }
    } catch (error) {
        console.warn('检查分片失败，将重新上传:', error);
    }

    const allChunkList = uploadFile.allChunkList; // 缓存引用，避免 undefined 检查问题
    const maxConcurrent = 6; // 最大并发数
    let currentIndex = 0; // 当前处理的分片索引

    console.log('初始化上传任务，最大并发数:', maxConcurrent, '总分片数:', allChunkList.length);

    // 上传单个分片 ---- 并且更新进度
    const uploadChunk = async (chunk: ChunkItem): Promise<void> => {
        // ✅ 跳过已上传分片
        if (chunk.finish) {
            console.log(`分片 ${chunk.index + 1} 已上传，跳过`);
            return;
        }

        try {
            // console.log(`开始上传分片 ${chunk.index + 1}/${chunk.chunkNumber}`);

            // 创建 FormData
            const formData = new FormData();
            formData.append('file', chunk.chunkFile);  //切片数据
            formData.append('fileHash', chunk.fileHash);
            formData.append('chunkHash', chunk.chunkHash);
            formData.append('fileName', chunk.fileName);
            formData.append('chunkIndex', chunk.index.toString());
            formData.append('chunkNumber', chunk.chunkNumber.toString());

            //chunkhash  = filehash - index ，但是filehash不是！！！
            // const abortController = abortControllers.get(chunk.fileHash.split('-')[0]);
            const abortController = abortControllers.get(chunk.fileHash);
            // 调用后端上传接口
            const response = await uploadChunkApi(formData, abortController?.signal);
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
                // console.log(`分片 ${chunk.index + 1} 上传完成，总进度: ${uploadItem.percentage}%`);
            }
        } catch (error: any) {
            // / ✅ 优先处理 AbortError
            if (error.name === 'AbortError' || error.name === 'CanceledError') {
                console.log(`分片 ${chunk.index + 1} 上传已取消`);
                throw new Error('UPLOAD_CANCELED');
            }

            // ✅ 处理网络错误
            if (error.code === 'ERR_NETWORK') {
                console.error(`分片 ${chunk.index} 网络错误`);
            }


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
        if (currentIndex > allChunkList.length - 1) return;      //注意是length

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
    } catch (error:any) {
        // ✅ 区分取消和失败
        //上面暂停抛出的错误，这里接住，就可以取消全部的上传了
    if (error.message === 'UPLOAD_CANCELED') {
        const uploadItem = uploadFileList.value.find(item => item.fileHash === uploadFile.fileHash);
        if (uploadItem) {
            uploadItem.state = 5; // 暂停状态
        }
        console.log('上传已暂停');
        return;
    }


        const uploadItem = uploadFileList.value.find(item => item.fileHash === uploadFile.fileHash);
        if (uploadItem) {
            uploadItem.state = 4; // 上传失败
        }
        console.error('上传过程出错:', error);
    }
}


const pauseUpload = function (file: UploadFile) {
    const abortController = abortControllers.get(file.fileHash);
    console.log('暂停上传文件', abortController);
    if (abortController) {
        abortController.abort();
        file.state = 5; // 已暂停
        console.log('[pauseUpload] 上传已暂停，文件:', file.fileName);
        console.log(`上传已暂停: ${file.fileName}`);
    }

}

//恢复上传目前就是重新上传 ---- 所以需要断点续传
const resumeUpload = function (uploadFile: UploadFile, uploadFileList: { value: Array<UploadFile> }) {
    // Implementation for resuming upload goes here
    uploadFile.state = 2; // 上传中
    abortControllers.delete(uploadFile.fileHash);
    console.log(`恢复上传: ${uploadFile.fileName}`);
    uploadSignleFile(uploadFile, uploadFileList);

}

export function useFileUpload() {
    return {
        uploadFiles,
        pauseUpload,
        resumeUpload,
    };
}

