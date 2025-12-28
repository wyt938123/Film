import uploadHttp from "../upload";

export const uploadChunkApi = async (data: any, signal?: AbortSignal) => {
    try {
        const response = await uploadHttp.post('/upload/chunk', data, { signal });
        return response;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}

export const mergeChunkApi = async (headers: any, data: { fileHash: string; fileName: string; fileNumber: number }) => {
    try {
        const response = await uploadHttp.post('/upload/merge', data, { headers: headers })
        return response; // 别忘了返回 response

    }
    catch (error) {
        console.error(error);
        throw error;
    }
}

export const checkFileApi = async (fileHash: string, fileName: string) => {
    try {
        const response = await uploadHttp.get('/upload/check', { params: { fileHash: fileHash ,fileName:fileName} });
        return response;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}
