import {obtenerUsuarioPorSuCorreo} from "../components/user/user.models.js";
import {verifyToken} from '../services/auth/auth.controllers.js'

export const authRole = (roles) => async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ').pop()
    const tokenData = await verifyToken(token);
    const usuario = await obtenerUsuarioPorSuCorreo(tokenData.carnet);
    if([].concat(roles).includes(usuario.cargo)){
      next()
    }else{
      res.status(409)
      res.send({
        message:`Como ${usuario.cargo} no tienes permiso para estar aqui`
      })
    }
  } catch (error) {
    res.status(500)
    res.send({
      message:`Como ${usuario.cargo} no tienes permiso para estar aqui`
    })
  }


}