import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
export async function auth(req, res, next) {
  try {
    const token = req.cookies.kart_session || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ message: 'Verification required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) return res.status(401).json({ message: 'Session is no longer valid' });
    req.user = user; next();
  } catch { return res.status(401).json({ message: 'Session expired or invalid' }); }
}
export const requireSeller = (req,res,next) => req.user?.role === 'seller' && req.user.sellerStatus === 'approved' ? next() : res.status(403).json({ message: 'Approved seller access required' });
export const requireAdmin = (req,res,next) => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Administrator access required' });

