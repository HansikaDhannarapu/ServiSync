import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
export async function auth(req,res,next){try{const token=req.cookies?.token||req.headers.authorization?.replace(/^Bearer /,''); if(!token) return res.status(401).json({message:'Please sign in to continue.'}); const data=jwt.verify(token,process.env.JWT_SECRET); const user=await User.findById(data.id); if(!user||!user.isActive) return res.status(401).json({message:'Your account is unavailable.'}); req.user=user; next();}catch{return res.status(401).json({message:'Your session has expired. Please sign in again.'});}}
export const allow=(...roles)=>(req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({message:'You do not have permission to do that.'});
