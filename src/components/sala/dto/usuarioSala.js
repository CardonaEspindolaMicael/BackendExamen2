import { z } from "zod";

export const usuarioSalaSchema = z.object({
  ciUsuario: z.string().min(5, "El CI del usuario es requerido"),
  idSala: z.string().uuid(),
  rol: z.enum(["ADMIN", "HOST","INVITADO"]), // 👈 Se restringen los valores posibles
  fecha: z.date().default(new Date()), // 👈 Establece la fecha actual por defecto
});