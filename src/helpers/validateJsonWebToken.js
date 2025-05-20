import jwt from 'jsonwebtoken';

export const validateJsonWebToken = (token='') => {

 try { 
   const verified=jwt.verify(token, process.env.SECRET_KEY_TOKEN);
  
  return [true,verified]
 } catch (error) {
  return [false,null]
 }

 }