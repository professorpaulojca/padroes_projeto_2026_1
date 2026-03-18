import { z } from 'zod';

export const pessoaSchema = z.object({
  nome: z
    .string()
    .min(1, 'O nome é obrigatório')
    .min(3, 'O nome deve ter no mínimo 3 caracteres'),
  dataNascimento: z
    .string()
    .min(1, 'A data de nascimento é obrigatória')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato inválido (dd/MM/yyyy)'),
});

export type PessoaFormData = z.infer<typeof pessoaSchema>;
