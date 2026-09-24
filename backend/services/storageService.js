import { randomUUID } from 'node:crypto';
import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const uploadsDirectory=fileURLToPath(new URL('../uploads/',import.meta.url));
export const uploadConfigured=()=>Boolean(process.env.CLOUDINARY_CLOUD_NAME&&process.env.CLOUDINARY_API_KEY&&process.env.CLOUDINARY_API_SECRET);

export async function uploadImage(file){
 if(uploadConfigured()){
  const {v2:cloudinary}=await import('cloudinary');
  cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET});
  const url=await new Promise((resolve,reject)=>{const stream=cloudinary.uploader.upload_stream({folder:'servisync'},(error,result)=>error?reject(error):resolve(result.secure_url));stream.end(file.buffer);});
  return{url,storage:'cloudinary'};
 }
 if(process.env.NODE_ENV==='production')throw Object.assign(new Error('Image uploads need Cloudinary configuration in production.'),{status:503});
 const extension=({ 'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'})[file.mimetype];
 if(!extension)throw Object.assign(new Error('Choose a JPG, PNG, or WebP image.'),{status:400});
 const name=`${randomUUID()}${extension}`;
 await mkdir(uploadsDirectory,{recursive:true});
 await writeFile(path.join(uploadsDirectory,name),file.buffer,{flag:'wx'});
 const apiOrigin=(process.env.PUBLIC_API_URL||`http://localhost:${process.env.PORT||5000}`).replace(/\/$/,'');
 return{url:`${apiOrigin}/api/uploads/local/${name}`,storage:'local'};
}
