import {
  registrarUsuarios,
  cambiarContrasena,
  contrasenaActual,
  validarUsuariosExistentes,
  obtenerUsuarios,
  updateUsuario,
  deleteUser,
  obtenerUsuariosById,
  obtenerUsuarioPorSuCorreo
 
} from "./user.models.js";
import bcrypt from "bcrypt";
import { registrarUsuarioSchema } from "./dto/sala.dto.js";
import { actualizarUsuarioSchema } from "./dto/usuario.update.dto.js";

export const getUsuariosById = async (req, res) => {
  const { ci } = req.params;
  try {
    const response = await obtenerUsuariosById(ci);
    res.status(200).json(response);
  } catch (error) {
    res.status(404).json(error);
  }
};

export const getUsuariosByCorreo = async (req, res) => {
  const { correo } = req.params;
  try {
    const response = await obtenerUsuarioPorSuCorreo(correo);
    res.status(200).json(response);
  } catch (error) {
    res.status(404).json(error);
  }
};



export const getUsuarios = async (req, res) => {
  try {
    const response = await obtenerUsuarios();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const postUsuario = async (req, res) => {
  try {
    // 👉 Validar usando Zod
    const datos = registrarUsuarioSchema.parse(req.body);

    const contrasenaHash = await encryptarContrasena(datos.contrasena);
    datos.contrasena=contrasenaHash;
    datos.nombre= datos.nombre.toLowerCase().trim();
   const nuevoUsuario = await registrarUsuarios(datos);

    res.json({
      message: 'Usuario registrado con éxito!',
      ...nuevoUsuario
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error(error);
    res.status(500).send({ error: 'Error al registrar el usuario' });
  }
};


export const actualizarUsuario = async (req, res) => {
  try {
    
    const datos = actualizarUsuarioSchema.parse(req.body);

    datos.nombre = datos.nombre.toLowerCase().trim();

    const usuarioActualizado = await updateUsuario(datos);

    res.status(200).json({
      message: 'Usuario actualizado con éxito!',
      ...usuarioActualizado
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error('Error al actualizar usuario:', error);
    res.status(500).send({ error: 'Error al actualizar el usuario' });
  }
};

export const eliminarUsuario = async (req, res) => {
    const { ci } = req.params;
    try {
      const response = await deleteUser(ci);
      res.status(200).json(response);
    } catch (error) {
      res.status(404).json(error);
    }
  };



export const patchContrasena = async (req, res) => {
  try {
    const { ci, antiguacontrasena, nuevacontrasena } = req.body;

    if (!(await validarUsuariosExistentes(ci))) {
      res.status(403).send(`El usuario con el ci : ${ci} no existe  `);
      return;
    }
    const match = await bcrypt.compare(
      antiguacontrasena,
      await contrasenaActual(ci)
    );
    if (match) {
      await cambiarContrasena(ci, await encryptarContrasena(nuevacontrasena));
      res.status(200).send("La contrasena ha sido actualizada");
    } else {
      res.status(403).send("Las contrasenas no coinciden");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const encryptarContrasena = async (contrasena) => {
  const salt = await bcrypt.genSalt(5);
  const newHash = await bcrypt.hash(contrasena, salt);
  return newHash;
};

export const renovarToken = async (req, res) => {
  return res.status(200).json({ message: "Token renovado con exito!" });
};

