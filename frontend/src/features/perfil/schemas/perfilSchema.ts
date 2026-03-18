import { z } from 'zod';

export const perfilSchema = z.object({
  nomeExibicao: z
    .string()
    .min(1, 'O nome é obrigatório')
    .min(3, 'O nome deve ter no mínimo 3 caracteres'),
});

export type PerfilFormData = z.infer<typeof perfilSchema>;

export const alterarSenhaSchema = z
  .object({
    senhaAtual: z
      .string()
      .min(1, 'A senha atual é obrigatória'),
    novaSenha: z
      .string()
      .min(1, 'A nova senha é obrigatória')
      .min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmarSenha: z
      .string()
      .min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  });

export type AlterarSenhaFormData = z.infer<typeof alterarSenhaSchema>;
