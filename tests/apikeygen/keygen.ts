import * as crypto from 'crypto';
export const generateApiKey = async () => {
  const randomBytes = crypto.randomBytes(32);
  const key = randomBytes.toString('hex');
  return key;
};
