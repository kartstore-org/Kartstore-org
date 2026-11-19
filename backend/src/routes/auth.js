import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/index.js';
import { nextKartstoreId } from '../utils/ids.js';
import { sendOtp, verifyOtp } from '../services/otp.js';
import { auth } from '../middleware/auth.js';
const router = Router();
const emailSchema = z.string().email().transform(v=>v.toLowerCase());
function setSession(res,user) { const token=jwt.sign({sub:user._id},process.env.JWT_SECRET,{expiresIn:'7d'}); res.cookie('kart_session',token,{httpOnly:true,secure:String(process.env.COOKIE_SECURE)==='true',sameSite:'lax',maxAge:7*86400000}); }
router.post('/register', async (req,res,next)=>{ try {
  const data=z.object({name:z.string().min(2),email:emailSchema,phone:z.string().min(8),password:z.string().min(8),accountType:z.enum(['customer','seller']).default('customer'),storeName:z.string().optional()}).parse(req.body);
  if(await User.findOne({$or:[{email:data.email},{phone:data.phone}]})) return res.status(409).json({message:'Email or mobile number is already registered'});
  const user=await User.create({name:data.name,email:data.email,phone:data.phone,passwordHash:await bcrypt.hash(data.password,12),role:data.accountType,kartstoreId:await nextKartstoreId(),sellerStatus:data.accountType==='seller'?'pending':'not_applied',storeName:data.storeName});
  await sendOtp(user.email,'registration'); await sendOtp(user.phone,'registration-phone');
  res.status(201).json({message:'Registration created. Verify the OTP sent to your email.',kartstoreId:user.kartstoreId,user:{name:user.name,email:user.email,role:user.role}});
 }catch(e){next(e)} });
router.post('/verify-registration',async(req,res,next)=>{try{const {email,emailCode,phoneCode}=z.object({email:emailSchema,emailCode:z.string().length(6),phoneCode:z.string().length(6)}).parse(req.body);const pending=await User.findOne({email});if(!pending)return res.status(404).json({message:'Account not found'});const emailOk=await verifyOtp(email,'registration',emailCode);if(!emailOk)return res.status(400).json({message:'Invalid or expired email OTP'});const phoneOk=await verifyOtp(pending.phone,'registration-phone',phoneCode);if(!phoneOk)return res.status(400).json({message:'Invalid or expired mobile OTP'});const user=await User.findOneAndUpdate({email},{emailVerified:true,phoneVerified:true},{new:true});if(!user)return res.status(404).json({message:'Account not found'});setSession(res,user);res.json({message:'Email and mobile verified',kartstoreId:user.kartstoreId,user:{name:user.name,email:user.email,role:user.role,sellerStatus:user.sellerStatus}})}catch(e){next(e)}});
router.post('/resend-registration-otp',async(req,res,next)=>{try{const email=emailSchema.parse(req.body.email);const user=await User.findOne({email,emailVerified:false});if(!user)return res.status(404).json({message:'Unverified registration not found'});await sendOtp(email,'registration');await sendOtp(user.phone,'registration-phone');res.json({message:'Email and mobile verification codes sent'})}catch(e){next(e)}});

router.post('/admin-login',async(req,res,next)=>{try{const {email,password}=z.object({email:emailSchema,password:z.string().min(1)}).parse(req.body);const user=await User.findOne({email,role:'admin'});if(!user||!await bcrypt.compare(password,user.passwordHash||''))return res.status(401).json({message:'Invalid administrator credentials'});setSession(res,user);res.json({message:'Administrator verified',user:{name:user.name,email:user.email,role:user.role}})}catch(e){next(e)}});
router.get('/me',auth,(req,res)=>res.json({user:{id:req.user._id,name:req.user.name,email:req.user.email,phone:req.user.phone,kartstoreId:req.user.kartstoreId,role:req.user.role,sellerStatus:req.user.sellerStatus,storeName:req.user.storeName}}));
router.post('/logout',(req,res)=>{res.clearCookie('kart_session');res.json({message:'Session closed'})});
router.post('/seller-access/request',async(req,res,next)=>{try{const id=z.string().regex(/^KART-\d{4}-\d{6}$/).parse(req.body.kartstoreId);const user=await User.findOne({kartstoreId:id});if(!user||user.role!=='seller')return res.status(404).json({message:'Seller account not found'});await sendOtp(user.email,'seller-access');res.json({message:'Verification code sent to the registered email',maskedEmail:user.email.replace(/^(.).+(@.*)$/,'$1***$2')})}catch(e){next(e)}});
router.post('/seller-access/verify',async(req,res,next)=>{try{const {kartstoreId,code}=z.object({kartstoreId:z.string(),code:z.string().length(6)}).parse(req.body);const user=await User.findOne({kartstoreId,role:'seller'});if(!user||!await verifyOtp(user.email,'seller-access',code))return res.status(400).json({message:'Invalid or expired verification code'});setSession(res,user);res.json({message:'Seller verified',kartstoreId:user.kartstoreId,sellerStatus:user.sellerStatus})}catch(e){next(e)}});
router.post('/seller-application',auth,async(req,res,next)=>{try{if(req.user.role!=='seller')return res.status(403).json({message:'Register as a seller first'});const storeName=z.string().min(2).parse(req.body.storeName);req.user.storeName=storeName;req.user.sellerStatus='pending';await req.user.save();res.json({message:'Seller application submitted for admin review'})}catch(e){next(e)}});
export default router;
