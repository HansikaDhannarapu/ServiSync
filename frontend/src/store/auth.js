import {create} from 'zustand';
import api from '../services/api';
export const useAuth=create((set)=>({user:null,loading:true,async load(){try{const x=await api.get('/auth/me');set({user:x.user});}catch{set({user:null});}finally{set({loading:false});}},async login(data){const x=await api.post('/auth/login',data);set({user:x.user});return x.user;},async register(data){const x=await api.post('/auth/register',data);set({user:x.user});return x.user;},async logout(){await api.post('/auth/logout');set({user:null});}}));
