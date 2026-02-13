import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'O email é obrigatório')
    .email('Informe um email válido'),
  password: z
    .string()
    .min(1, 'A senha é obrigatória')
    .min(6, 'A senha deve ter no mínimo 6 caracteres'),
  rememberMe: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;
