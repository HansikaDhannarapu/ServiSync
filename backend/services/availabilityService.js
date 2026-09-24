import { Availability, Booking } from '../models/index.js';
const mins = t => { const [h,m]=String(t||'').split(':').map(Number); return h*60+m; };
export const overlaps=(startA,endA,startB,endB)=>mins(startA)<mins(endB)&&mins(endA)>mins(startB);
export const containsInterval=(slotStart,slotEnd,start,end)=>mins(start)>=mins(slotStart)&&mins(end)<=mins(slotEnd);
export const validInterval=(date,startTime,endTime)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date||''))||!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(startTime||''))||!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(endTime||''))||mins(startTime)>=mins(endTime))return false;const parsed=new Date(`${date}T00:00:00Z`);return !Number.isNaN(parsed.valueOf())&&parsed.toISOString().slice(0,10)===date;};
export async function assertAvailable(provider,date,startTime,endTime,exceptId) {
 if(!validInterval(date,startTime,endTime)) throw Object.assign(new Error('Choose a valid date and time range.'),{status:400});
 const bookings=await Booking.find({provider,scheduledDate:date,status:{$nin:['CANCELLED','SERVICE_COMPLETED','CUSTOMER_CONFIRMED','REVIEWED']},...(exceptId?{_id:{$ne:exceptId}}:{})});
 if(bookings.some(b=>overlaps(startTime,endTime,b.startTime,b.endTime))) throw Object.assign(new Error('This provider already has a booking during that time.'),{status:409});
 const slots=await Availability.find({provider,date,isBooked:false});if(!slots.length)throw Object.assign(new Error('This provider has no availability posted for that day.'),{status:409});if(!slots.some(slot=>containsInterval(slot.startTime,slot.endTime,startTime,endTime)&&!(slot.reservations||[]).some(r=>overlaps(startTime,endTime,r.startTime,r.endTime))))throw Object.assign(new Error('The selected time is unavailable or outside provider hours.'),{status:409});
 return true;
}
export async function reserveTime(provider,date,startTime,endTime,key){const slots=await Availability.find({provider,date,isBooked:false});for(const slot of slots){if(!containsInterval(slot.startTime,slot.endTime,startTime,endTime))continue;const reserved=await Availability.findOneAndUpdate({_id:slot._id,isBooked:false,reservations:{$not:{$elemMatch:{startTime:{$lt:endTime},endTime:{$gt:startTime}}}}},{$push:{reservations:{key,startTime,endTime}}},{new:true});if(reserved)return String(reserved._id);}throw Object.assign(new Error('That time was just booked. Please choose another available time.'),{status:409});}
export async function releaseTime(slotId,key){if(slotId)await Availability.updateOne({_id:slotId},{$pull:{reservations:{key}}});}
