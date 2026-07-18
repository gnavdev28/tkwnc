import axios from "axios";

const API_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true // Cho phép trình duyệt tự động đính kèm cookie session connect.sid trong mỗi API request
});

export default api;
