import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
dotenv.config({path:fileURLToPath(new URL('./.env',import.meta.url))});
const mongoose=(await import('mongoose')).default;
const app=(await import('./app.js')).default;
const port=process.env.PORT||5000;
if(!process.env.JWT_SECRET){console.error('Configuration error: set JWT_SECRET in backend/.env.');process.exit(1);}
try{await mongoose.connect(process.env.MONGO_URI||'mongodb://127.0.0.1:27017/servisync',{serverSelectionTimeoutMS:7000});console.log('ServiSync connected to MongoDB.');}
catch(err){console.error(`MongoDB connection failed: ${err.message}. Check MONGO_URI and ensure MongoDB is running.`);process.exit(1);}
const server=app.listen(port,()=>console.log(`ServiSync API listening on port ${port}`));
server.on('error',async error=>{
 if(error.code!=='EADDRINUSE')console.error(`ServiSync API could not listen on port ${port}: ${error.message}`);
 let existingServiSync=false;
 if(error.code==='EADDRINUSE'){
  try{const response=await fetch(`http://127.0.0.1:${port}/api/health`,{signal:AbortSignal.timeout(2000)});const health=await response.json();existingServiSync=response.ok&&health.service==='ServiSync API'&&health.status==='ok'&&health.database==='connected';}catch{}
  if(existingServiSync)console.log(`ServiSync API is already running on port ${port}; keeping the existing process.`);
  else console.error(`Port ${port} is already in use by another service. It was left untouched.`);
 }
 await mongoose.disconnect();
 process.exit(existingServiSync?0:1);
});
