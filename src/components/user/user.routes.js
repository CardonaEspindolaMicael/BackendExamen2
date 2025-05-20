import {Router} from "express"
import { postUsuario,patchContrasena, getUsuarios, actualizarUsuario, eliminarUsuario,renovarToken,getUsuariosById} from "./user.controllers.js";
const routerUser = Router() ;
import { checkAuth } from "../../middlewares/auth.js";
import { authRole } from "../../middlewares/auth_role.js";
import { validateCreate } from "../../validators/user.js";

routerUser.get('/cajeros', (req, res) => {
  res.send('Hola Mundo');
});

routerUser.get('/',[checkAuth] ,getUsuarios)
routerUser.get('/:ci',checkAuth,getUsuariosById)
routerUser.put('/',checkAuth,actualizarUsuario)
routerUser.post('/',validateCreate,postUsuario)
routerUser.patch('/cambiarClave',patchContrasena)
routerUser.delete('/:ci',checkAuth,eliminarUsuario )
routerUser.get('/renew',checkAuth, renovarToken);


export default routerUser; 