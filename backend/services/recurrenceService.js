import { ServiceRequest } from '../models/index.js';

const ignored=new Set(['the','and','for','with','from','that','this','there','have','has','was','are','but','not','after','before','my','our','home']);
const words=value=>new Set(String(value||'').toLowerCase().match(/[a-z]{3,}/g)?.filter(word=>!ignored.has(word))||[]);

export async function findRecurringIssue(customer,category,description){
 const current=words(description);
 if(current.size<2)return{detected:false,previousCount:0,suggestion:''};
 const prior=await ServiceRequest.find({customer,category,description:{$exists:true}}).sort('-createdAt').limit(30).select('_id description createdAt');
 const similar=prior.filter(item=>{const previous=words(item.description);let common=0;for(const word of current)if(previous.has(word))common++;return common/Math.max(1,new Set([...current,...previous]).size)>=0.3;});
 return{detected:similar.length>0,previousCount:similar.length,suggestion:similar.length?'This looks similar to an earlier request. Check the previous service notes or invoice and tell your provider if the issue returned.':'',relatedRequestIds:similar.slice(0,5).map(item=>item._id)};
}
