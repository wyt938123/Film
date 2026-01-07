import axios from "axios";
//单例模式
const uploadHttp = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
});

export default uploadHttp;
