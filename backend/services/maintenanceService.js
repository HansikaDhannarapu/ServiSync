import { MaintenanceReminder } from '../models/index.js';

const intervals={'AC Repair':6,'Appliance Repair':12,'Cleaning':3,'Plumbing':12,'Electrical':12};
export async function createMaintenanceReminder(booking,category){
 const months=intervals[category];
 if(!months)return null;
 const base=new Date(`${booking.scheduledDate||new Date().toISOString().slice(0,10)}T12:00:00Z`);
 if(Number.isNaN(base.valueOf()))return null;
 base.setUTCMonth(base.getUTCMonth()+months);
 return MaintenanceReminder.findOneAndUpdate({booking:booking._id},{customer:booking.customer,booking:booking._id,category,title:`Time to check your ${category.toLowerCase()} service`,suggestion:`It has been about ${months} months since this service. Consider arranging a maintenance check.`,dueDate:base},{upsert:true,new:true,setDefaultsOnInsert:true});
}
