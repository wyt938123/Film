// 计算文件 hash 和分片
//需要是纯函数
// @ts-ignore
import SparkMD5 from 'spark-md5';


self.onmessage =  (e) => {
    //只有promise完全没意义，本身是同步的
    // 仅针对「成功态（resolve）」，失败态（reject）不受泛型约束
        const { file, chunkSize } = e.data; // 从消息中获取文件和分片大小
        const fileChunkList = [];
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
            fileChunkList.push({ chunkFile: chunk });
            
            fileReader.readAsArrayBuffer(chunk);     // ->二进制
        };

        fileReader.onload = (e) => {
            //e是成功读取的二进制数据的事件对象        ----currentChunk>=chunkCount 终止条件
            //成功读取到了结果后
            console.log(e,'读取分片结果对象');
            if (e.target?.result) {
                // 追加到 MD5 计算
                spark.append(e.target.result ); //成功读取到的结果是 ArrayBuffer 类型 
                currentChunk++;

                if (currentChunk < chunkCount) {
                    // 继续读取下一个分片
                    loadNext();
                } else {
                    // 所有分片读取完成，计算最终 hash
                    const fileHash = spark.end();
                    // 将文件 hash 和分片列表发送回主线程
                    self.postMessage( { fileHash, fileChunkList } );
                }
            }
        };

        fileReader.onerror = () => {
            new Error('文件读取失败');
        };

        // 开始读取第一个分片
        loadNext();
}