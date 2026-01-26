import axios from "axios";
//单例模式
const uploadHttp = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});
// baseURL: "http://localhost:3000",
export default uploadHttp;
