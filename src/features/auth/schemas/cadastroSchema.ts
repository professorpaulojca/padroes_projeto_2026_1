import { z } from 'zod';

export const cadastroSchema = z
  .object({
    nomeExibicao: z
      .string()
      .min(1, 'O nome é obrigatório')
      .min(3, 'O nome deve ter no mínimo 3 caracteres'),
    email: z
      .string()
      .min(1, 'O email é obrigatório')
      .email('Informe um email válido'),
    senha: z
      .string()
      .min(1, 'A senha é obrigatória')
      .min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmarSenha: z
      .string()
      .min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  });

export type CadastroFormData = z.infer<typeof cadastroSchema>;
