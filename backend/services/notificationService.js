import { Notification } from '../models/index.js';
export const notify = (recipient,title,message,type='INFO') => Notification.create({recipient,title,message,type});
