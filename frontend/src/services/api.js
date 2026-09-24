import axios from 'axios';
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:5000/api',withCredentials:true});
api.interceptors.response.use(r=>r.data,e=>Promise.reject(new Error(e.response?.data?.message||'We could not complete that request. Please try again.')));
export default api;
