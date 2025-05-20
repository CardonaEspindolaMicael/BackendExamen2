import {Router} from "express"
import {  postSala, getSalas, actualizarSala, eliminarSala,eliminarUsuarioDeSala,getSalaById, obtenerLosUsuariosDeUnaSalas,obtenerLasSalasDeUnUsuarioInvitado, isHost, actualizarSala2, getSalaByCi, agregarUsuarioASala} from "./sala.controllers.js";
const routerSala = Router() ;
import { checkAuth } from "../../middlewares/auth.js";
import { getUsuariosByCorreo } from "../user/user.controllers.js";

routerSala.get('/', getSalas)
routerSala.post('/', postSala)
routerSala.get('/:id', getSalaById)
routerSala.put('/:id', actualizarSala)
routerSala.put('/:id/room', actualizarSala2) 
routerSala.delete('/:id', eliminarSala)

 
routerSala.get('/:id/usuarios', obtenerLosUsuariosDeUnaSalas)
routerSala.delete('/:id/usuarios/:correo', eliminarUsuarioDeSala)
routerSala.get('/usuarios/:ci', obtenerLasSalasDeUnUsuarioInvitado)
routerSala.post('/:id/usuarios/:correo', agregarUsuarioASala)
routerSala.get('/:correo/identificacion',getUsuariosByCorreo)
routerSala.get('/:id/host/:ci', isHost)
routerSala.put('/:id/sala',actualizarSala)
routerSala.get('/host-sala/:ci', getSalaByCi) // Este lo puedes revisar si ya no es necesario

export default routerSala; 