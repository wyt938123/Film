import axios from "axios";

const chatApi = async (message: any) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/chatai`,
      // 请求体
      message,
      {
        // 请求头
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default chatApi;
