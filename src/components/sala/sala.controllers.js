import { obtenerUsuarioPorSuCorreo } from "../user/user.models.js";
import { registrarSalaSchema } from "./dto/sala.dto.js";
import { usuarioSalaSchema } from "./dto/usuarioSala.js";
import {

  actualizarSalaModel,
  actualizarSalaModel2,
  agregarUsuarioASalaModel,
  crearSalaModel,
  eliminarSalaModel,
  eliminarUsuarioDeSalaModel,
  getSalasByCiModel,
  getSalasByIdModel,
  isHostModel,
  obtenerLosUsuariosDeUnaSalaModel,
  obtenerLasSalasDeUnUsuarioInvitadoModel,
  obtenerSalasModel,
} from "./sala.models.js";
 
// ... otras funciones
export const getSalas = async (req, res) => {
  try {
    const response = await obtenerSalasModel();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const obtenerLosUsuariosDeUnaSalas = async (req, res) => {
  try { 
    const { id } = req.params;
    const response = await obtenerLosUsuariosDeUnaSalaModel( id);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const obtenerLasSalasDeUnUsuarioInvitado = async (req, res) => {
  try {
    const { ci } = req.params;
    const response = await obtenerLasSalasDeUnUsuarioInvitadoModel(ci);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getSalaById= async (req, res) => {
  try {
    const { id } = req.params;
    const response = await getSalasByIdModel(id);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const getSalaByCi= async (req, res) => {
  try {
    const { ci } = req.params;
    const response = await getSalasByCiModel(ci);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const postSala = async (req, res) => {
  try {
    const datos=registrarSalaSchema.parse(req.body);

    // Crear la sala
    const nuevaSala = await crearSalaModel(datos);

    res.json({ message: "Sala registrada con éxito!", sala: nuevaSala });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};



export const actualizarSala = async (req, res) => {
  try {
    const {id}= req.params;
    const {
       diagrama
    } = req.body;


    const response=await actualizarSalaModel(
      id,
      diagrama
      )

      res.status(200).json(response );
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const actualizarSala2 = async (req, res) => {
  try {
    const {id}= req.params;
    const {
       nombre,
       descripcion
    } = req.body;


    await actualizarSalaModel2(
      id,
      nombre,
      descripcion
      )

      res.status(201).send("Usuario actualizado con exito!");
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};


export const isHost = async (req, res) => {
  const { ci, id } = req.params;
  try {
    const response = await isHostModel(ci, id);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return error;
  }

}

export const eliminarSala = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await eliminarSalaModel(id);
    res.status(200).json(response);
  } catch (error) {
    res.status(404).json(error);
  }
};

export const eliminarUsuarioDeSala = async (req, res) => {
  try {
     const { id,correo } = req.params;
    const user = await obtenerUsuarioPorSuCorreo(correo)

    let ci=''
    if (user){
     ci=user.ci
    } else {
         res.json({message: `El usuario con correo ${correo} no esta registrado`})
    }
      await eliminarUsuarioDeSalaModel(ci, id);
      res.json({ message: "Usuario eliminado de la sala" });
  } catch (error) {
      console.error(error);
      res.status(500).send(error);
  }
};

export const agregarUsuarioASala = async (req, res) => {
  try {
    const { id,correo } = req.params;
    const user = await obtenerUsuarioPorSuCorreo(correo)
    let ci=''
    if (user){
     ci=user.ci
    } else {
         res.json({message: `El usuario con correo ${correo} no esta registrado`})
    }
   
    const {rol}=req.body;
    const datos=usuarioSalaSchema.parse({
      idSala:id,
      ciUsuario:ci,
      rol:rol 
    });
    const nuevaUsuarioSala = await agregarUsuarioASalaModel(datos);

    res.json({ message: "Usuario agregado a sala todo bon", sala: nuevaUsuarioSala });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
