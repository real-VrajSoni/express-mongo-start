import User from './model.js';
import ApiError from '../../common/utils/ApiError.js';
import { hashToken } from '../../common/utils/token.js';

export default async function requireAuth(req, res, next) {
  const header = req.get('Authorization') || '';
  const match = /^Bearer ([a-f0-9]{64})$/i.exec(header);
  if (!match) throw new ApiError(401, 'Please log in first');

  const token = match[1];
  const user = await User.findOne({
    sessionTokenHash: hashToken(token),
    sessionExpiresAt: { $gt: new Date() },
  });
  if (!user) throw new ApiError(401, 'Your session is invalid or expired');

  req.user = user;
  req.authToken = token;
  next();
}
