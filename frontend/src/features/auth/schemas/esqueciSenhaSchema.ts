import { z } from 'zod';

export const esqueciSenhaSchema = z.object({
  email: z
    .string()
    .min(1, 'O email é obrigatório')
    .email('Informe um email válido'),
});

export type EsqueciSenhaFormData = z.infer<typeof esqueciSenhaSchema>;

export const redefinirSenhaSchema = z
  .object({
    token: z.string().min(1, 'O código é obrigatório'),
    novaSenha: z
      .string()
      .min(1, 'A nova senha é obrigatória')
      .min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmarSenha: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  });

export type RedefinirSenhaFormData = z.infer<typeof redefinirSenhaSchema>;
