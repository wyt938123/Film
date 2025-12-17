<template>
    <div class="upload-file-page min-h-screen bg-gray-50">
        <!-- 顶部导航栏 -->
        <div class="fixed top-0 left-0 right-0 bg-white z-50">
            <van-nav-bar title="上传视频" left-arrow @click-left="onClickLeft" />
        </div>

        <!-- 主体内容 -->
        <div class="pt-[46px] px-4 py-6">
            <!-- 上传区域 -->
            <div class="upload-drag bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center cursor-pointer hover:border-blue-400 transition-colors"
                @click="handleClick">

                <input type="file" 
                ref="fileInput" 
                @change="handleUploadFile" 
                accept="" 
                multiple="false"
                style="display: none" />
        
                <div class="flex flex-col items-center justify-center">
                    <van-icon name="upgrade" size="50" color="#c0c4cc" />
                    <p class="mt-4 text-gray-500">点击选择视频文件</p>
                </div>
            </div>

            <!-- 上传文件列表 -->
            <div class="mt-4 space-y-3" v-if="uploadFileList.length > 0">
                <div v-for="item in uploadFileList" :key="item.fileHash" class="bg-white rounded-lg p-4 shadow-sm">
                    <div class="flex items-center justify-between">
                        <div class="flex-1 mr-3">
                            <!-- 进度条 -->
                            <div class="mb-2">
                                <van-progress :percentage="item.percentage" :show-pivot="true" stroke-width="8"
                                    color="#1989fa" />
                            </div>

                            <!-- 状态文字 -->
                            <div class="text-sm text-gray-600">
                                <div v-if="item.state === 0" class="h-6"></div>
                                <p v-else-if="item.state === 1" class="text-blue-500">正在解析中...</p>
                                <p v-else-if="item.state === 2" class="text-blue-500">正在上传中...</p>
                                <p v-else-if="item.state === 3" class="text-green-500">上传完成</p>
                                <p v-else-if="item.state === 4" class="text-red-500">上传失败</p>
                            </div>
                        </div>

                        <!-- 取消按钮 -->
                        <van-button v-if="![0, 1].includes(item.state)" type="danger" size="small"
                            @click="cancelUpload(item)">
                            取消
                        </van-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// @ts-ignore
import SparkMD5 from 'spark-md5';

const router = useRouter();
const fileInput = ref<HTMLInputElement | null>(null);
//t) 里已经拿到了事件对象，因此不需要再去点击 DOM 直接读取 input 元素：

const chunkSize = 1 * 1024 * 1024; // 1MB 分片大小
const uploadFileList = ref<UploadFile[]>([]);  // 上传文件列表

interface ChunkItem {
    fileHash: string; // 总文件hash
    fileSize: number; // 总文件size
    fileName: string;// 总文件name
    index: number; 
    
    chunkFile: Blob;  // 切片文件本身
    chunkHash: string;  // 单个切片hash,以 - 连接
    chunkSize: number; // 切片文件大小
    chunkNumber: number; // 切片个数
    finish: boolean;
}

interface UploadFile {
    id?: number;
    fileHash: string;
    fileName?: string;
    fileSize?: number;
    allChunkList?: ChunkItem[]; // 所有请求分片列表
    whileUploadingChunkList?: any[];  // 正在上传的分片列表
    percentage: number; // 上传进度百分比
    finishNumber?: number; // 已完成分片数量
    errNumber?: number; // 失败分片数量
    state: number; // 0:待处理 1:解析中 2:上传中 3:完成 4:失败
}



const onClickLeft = () => {
    router.back();
};
// 处理文件上传 选定好文件触发的逻辑      ---- 这里包括点击逻辑吗
const handleUploadFile = async (event: Event) => {
    // 此处不实现具体逻辑，仅作为占位
    console.log('文件选择', event);
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) {
        return;
    }
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
        const { fileHash, fileChunkList } = await getHashAndChunk(file)
        console.log('fileHahs,fileChunkListok', fileHash);

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
        uploadSignleFile(inTackArrItem);
    });
};

const handleClick = () => {
    fileInput.value?.click();
};



const cancelUpload = (item: UploadFile) => {
    // 此处不实现具体逻辑，仅作为占位
    console.log('取消上传', item);
};

const uploadSignleFile = async function(uploadFile: UploadFile) {
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
            const response = await fetch('http://localhost:3000/upload/chunk', {
                method: 'POST',
                body: formData
                //// ❌ 注意：不要手动设置 Content-Type！浏览器会自动添加正确的 multipart/form-data 及边界符
                 // "Content-Type": "multipart/form-data" // 错误写法
            });
            
            const result = await response.json();
            
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
                const mergeResponse = await fetch('http://localhost:3000/upload/merge', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fileHash: uploadFile.fileHash,
                        fileName: uploadFile.fileName,
                        chunkNumber: allChunkList.length
                    })
                });
                
                const mergeResult = await mergeResponse.json();
                
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

// 计算文件 hash 和分片
const getHashAndChunk = function(file: File) {
    // 仅针对「成功态（resolve）」，失败态（reject）不受泛型约束
    return new Promise<{ fileHash: string; fileChunkList: Array<{ chunkFile: Blob }> }>((resolve, reject) => {
        const chunkList: Array<{ chunkFile: Blob }> = [];
        const chunkCount = Math.ceil(file.size / chunkSize); // 总分片数
        const spark = new SparkMD5.ArrayBuffer();
        const fileReader = new FileReader();
        let currentChunk = 0;

        // 读取每个分片 ----------------------   下面的逻辑仅是为了计算hash
        const loadNext = () => {
            const start = currentChunk * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            // 、、1MB 大小的 Blob 对应的字节数是 1048576 字节
            const chunk = file.slice(start, end);      //0-1MB 1-2MB 2-3MB 3-4MB  
            
            // 保存分片
            chunkList.push({ chunkFile: chunk });
            
            fileReader.readAsArrayBuffer(chunk);     // ->二进制
        };

        fileReader.onload = (e) => {
            //e是成功读取的二进制数据的事件对象        ----currentChunk>=chunkCount 终止条件
            //成功读取到了结果后
            console.log(e,'读取分片结果对象');
            if (e.target?.result) {
                // 追加到 MD5 计算
                spark.append(e.target.result as ArrayBuffer); //成功读取到的结果是 ArrayBuffer 类型 
                currentChunk++;

                if (currentChunk < chunkCount) {
                    // 继续读取下一个分片
                    loadNext();
                } else {
                    // 所有分片读取完成，计算最终 hash
                    const fileHash = spark.end();
                    resolve({
                        fileHash,
                        fileChunkList: chunkList
                    });
                }
            }
        };

        fileReader.onerror = () => {
            reject(new Error('文件读取失败'));
        };

        // 开始读取第一个分片
        loadNext();
    });
}
</script>

<style scoped>
.upload-drag {
    transition: all 0.3s ease;
}

.upload-drag:hover {
    border-color: #1989fa;
}
</style>
