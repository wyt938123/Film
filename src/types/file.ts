export interface ChunkItem {
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



export enum UploadState {
    WAITING = 0,
    PARSING = 1,
    UPLOADING = 2,
    SUCCESS = 3,
    FAILURE = 4,
    STOPPED = 5,
}

export interface UploadFile {
    id?: number;
    fileHash: string;
    fileName?: string;
    fileSize?: number;
    allChunkList?: ChunkItem[]; // 所有请求分片列表
    whileUploadingChunkList?: any[];  // 正在上传的分片列表
    percentage: number; // 上传进度百分比
    finishNumber?: number; // 已完成分片数量
    errNumber?: number; // 失败分片数量
    state: UploadState; // 状态
}