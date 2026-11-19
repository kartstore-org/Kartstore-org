import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true }, email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phone: { type: String, unique: true, sparse: true, trim: true }, passwordHash: String,
  kartstoreId: { type: String, unique: true, sparse: true }, role: { type: String, enum: ['customer','seller','admin'], default: 'customer' },
  sellerStatus: { type: String, enum: ['not_applied','pending','approved','rejected','suspended'], default: 'not_applied' },
  emailVerified: { type: Boolean, default: false }, phoneVerified: { type: Boolean, default: false },
  address: { line1: String, city: String, state: String, postalCode: String, country: String },
  storeName: String, createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const counterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } });
const otpSchema = new Schema({ destination: { type: String, required: true, index: true }, purpose: { type: String, required: true }, codeHash: { type: String, required: true }, attempts: { type: Number, default: 0 }, expiresAt: { type: Date, required: true, index: { expires: 0 } } }, { timestamps: true });
const productSchema = new Schema({
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, kartstoreId: { type: String, required: true, index: true },
  title: { type: String, required: true, trim: true }, description: String, category: { type: String, default: 'General' }, brand: String,
  sku: { type: String, trim: true }, images: [String], price: { type: Number, required: true, min: 0 }, costPrice: { type: Number, min: 0 },
  stock: { type: Number, default: 0, min: 0 }, productType: { type: String, enum: ['marketplace','dropshipping','affiliate'], default: 'marketplace' },
  affiliateUrl: String, supplierName: String, supplierProductId: String, status: { type: String, enum: ['pending','published','rejected','archived'], default: 'pending' },
  source: { type: String, default: 'manual' }
}, { timestamps: true });
productSchema.index({ seller: 1, sku: 1 }, { unique: true, sparse: true });
productSchema.index({ title: 'text', description: 'text', category: 'text' });

const orderSchema = new Schema({
  orderNumber: { type: String, unique: true, index: true }, customerName: String, email: { type: String, lowercase: true, index: true }, phone: { type: String, index: true },
  address: { line1: String, city: String, state: String, postalCode: String, country: String },
  items: [{ product: { type: Schema.Types.ObjectId, ref: 'Product' }, title: String, image: String, quantity: Number, unitPrice: Number, seller: { type: Schema.Types.ObjectId, ref: 'User' }, sellerKartstoreId: String }],
  total: Number, paymentMethod: { type: String, enum: ['cod','online'], default: 'cod' }, paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  status: { type: String, enum: ['placed','processing','shipped','out_for_delivery','delivered','cancelled','returned','refunded'], default: 'placed' },
  trackingNumber: String, courier: String, trackingUrl: String, events: [{ status: String, note: String, at: { type: Date, default: Date.now } }]
}, { timestamps: true });
orderSchema.index({ email: 1, createdAt: -1 }); orderSchema.index({ phone: 1, createdAt: -1 });

export const User = model('User', userSchema);
export const Counter = model('Counter', counterSchema);
export const OTP = model('OTP', otpSchema);
export const Product = model('Product', productSchema);
export const Order = model('Order', orderSchema);
