import { Counter } from '../models/index.js';
export async function nextKartstoreId() {
  const year = new Date().getFullYear();
  const counter = await Counter.findOneAndUpdate({ _id: `kartstore-${year}` }, { $inc: { seq: 1 } }, { upsert: true, new: true });
  return `KART-${year}-${String(counter.seq).padStart(6, '0')}`;
}
export function makeOrderNumber() { return `KSO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`; }
