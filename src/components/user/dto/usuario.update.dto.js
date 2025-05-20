import { z } from "zod";

export const actualizarUsuarioSchema = z.object({
  ci: z.string().min(5, "El CI es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellidos: z.string().min(1, "Los apellidos son requeridos"),
  correo: z.string().email("Correo no válido"),
  sexo: z.enum(["Masculino", "Femenino", "Otro"]),
  telefono: z.string().min(5, "El teléfono es requerido"),
});
