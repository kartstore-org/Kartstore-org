import axios from 'axios';
const api=axios.create({baseURL:process.env.KARTSTORE_API_URL||'http://localhost:5000/api/v1',withCredentials:true});
api.interceptors.response.use(r=>r,e=>Promise.reject(e.response?.data||{message:e.message||'Network error'}));
export default api;
