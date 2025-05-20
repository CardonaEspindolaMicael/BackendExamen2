import { verifyToken } from "../services/auth/auth.controllers.js"



 export const checkAuth = async (req, res, next) => {
  try {
  
    if(req.headers.authorization){
      
    const token = req.headers.authorization
    const tokenData = await verifyToken(token)
    if (tokenData.correo) {
      next()
    } else {
      res.status(400)
      res.send({ error: 'Acceso restringido para este usuario' })
    }
    }else {
      res.status(403)
      res.send({error:"Logueese"})
  
    }

  } catch (error) {
   console.log(error)
    res.status(403)
    res.send({error:"Usuario no autorizado"})


  }

}

