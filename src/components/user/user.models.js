import pkg from '@prisma/client';
import { registrarUsuarioSchema } from "../user/dto/sala.dto.js";
const {PrismaClient} = pkg;
const prisma = new PrismaClient();
export const obtenerUsuarios = async () => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        rol: {
          select: {
            cargo: true
          }
        }
      }
    });
    return usuarios;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const registrarUsuarios = async (
datos) => {
  try {
    const {  ci,
      nombre,
      apellidos,
      correo,
      sexo,
      contrasena,
      telefono,
      idRol}= datos
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        ci,
        nombre,
        apellidos,
        correo,
        sexo,
        contrasena,
        telefono,
        rol: {
          connect: {
            id: idRol // 👈 asegúrate que este sea el campo único en la tabla Rol
          }
        }
      }
    });
    return nuevoUsuario;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};



export const updateUsuario = async (user) => {
  const {
    ci,
    nombre,
    apellidos,
    correo,
    sexo,
    contrasena,
    telefono
  } = user;

  try {
    const usuarioActualizado = await prisma.usuario.update({
      where: { ci },
      data: {
        nombre,
        apellidos,
        correo,
        sexo,
        contrasena,
        telefono
      }
    });
    return usuarioActualizado;
  } catch (error) {
    console.error(error);
    return error;
  }
};



export const validarUsuariosExistentes = async (ci) => {
  const user = await prisma.usuario.findUnique({ where: { ci } });
  return !!user;
};

export const deleteUser = async (ci) => {
  try {
    const existeUsuario = await validarUsuariosExistentes(ci);
    if (!existeUsuario) {
      return {
        message: `Error: el usuario con ci ${ci} no existe`
      };
    }

    await prisma.usuario.delete({ where: { ci } });

    return {
      message: `Usuario eliminado`
    };
  } catch (error) {
    console.error(error);
    return error;
  }
};




export const cambiarContrasena = async (ci, nuevaContrasena) => {
  try {
    const usuarioActualizado = await prisma.usuario.update({
      where: { ci },
      data: { contrasena: nuevaContrasena }
    });
    return usuarioActualizado;
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    throw error;
  }
};


export const contrasenaActual = async (ci) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { ci },
      select: { contrasena: true }
    });

    return usuario?.contrasena || null;
  } catch (error) {
    console.error("Error al obtener la contraseña:", error);
    throw error;
  }
};



export const obtenerUsuarioPorSuCorreo = async (correo) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: {correo},
      include: {
        rol: {
          select: { 
            cargo: true
          }
        }
      }
    });
    return usuario;
  } catch (error) {
    console.error(error);
    return error;
  }
};



export const obtenerUsuariosById = async (ci) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: {
        ci: ci
      }
    });
    return usuario;
  } catch (error) {
    console.error(error);
    return error;
  } 
};

