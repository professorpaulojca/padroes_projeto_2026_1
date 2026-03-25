import { z } from 'zod';

export const pessoaSchema = z.object({
  nome: z
    .string()
    .min(1, 'O nome é obrigatório')
    .min(3, 'O nome deve ter no mínimo 3 caracteres'),
  sobrenome: z.string().optional().default(''),
  cpf: z.string().optional().default(''),
  rg: z.string().optional().default(''),
  dataNascimento: z
    .string()
    .min(1, 'A data de nascimento é obrigatória')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato inválido (dd/MM/yyyy)'),
  sexo: z.string().optional().default(''),
  email: z.string().optional().default(''),
  telefone: z.string().optional().default(''),
  celular: z.string().optional().default(''),
  observacoes: z.string().optional().default(''),
  tipoSanguineo: z.string().optional().default(''),
  estadoCivil: z.string().optional().default(''),
  nacionalidade: z.string().optional().default(''),
  naturalidade: z.string().optional().default(''),
  profissao: z.string().optional().default(''),
  empresa: z.string().optional().default(''),
});

export type PessoaFormData = z.infer<typeof pessoaSchema>;
