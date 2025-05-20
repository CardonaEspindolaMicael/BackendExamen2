import { check } from "express-validator";
import {validateResult} from "../helpers/validateHelper.js"
import { obtenerUsuarioPorSuCorreo } from "../components/user/user.models.js";
export const validateCreate=[

  check('ci').exists().not().isEmpty().custom(async value=>{
    const usuario = await obtenerUsuarioPorSuCorreo(value);
    if(usuario){
      return Promise.reject('El usuario ya existe');
    }
  }
  ),
  check('nombre').exists().not().isEmpty(),
  check('telefono').exists().not().isEmpty().isNumeric(),
  check('correo').exists().isEmail().withMessage("Error correo no valido"),
  check('sexo').exists().not().isEmpty(),
  check('contrasena').exists().not().isEmpty().withMessage("Error contraseña no puede estar vacia"),
  (req,res,next)=>{
    validateResult(req,res,next)
  }

]
