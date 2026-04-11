import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

export const generateApiKey = async () => {
  const randomBytes = crypto.randomBytes(32);
  const key = randomBytes.toString('hex');
  const prefix = 'uwl';
  return `${prefix}_${key}`;
};

export const hashApiKey = async (apiKey: string) => {
  return await bcrypt.hash(apiKey, 12);
};







