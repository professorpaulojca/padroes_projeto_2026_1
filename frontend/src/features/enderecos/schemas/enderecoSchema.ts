import { z } from 'zod';

export const enderecoSchema = z.object({
  cep: z
    .string()
    .min(1, 'O CEP é obrigatório')
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido (ex: 01310-100)'),
  numero: z
    .string()
    .min(1, 'O número é obrigatório'),
  complemento: z.string().optional(),
  tipoEndereco: z.enum(['RESIDENCIAL', 'COMERCIAL', 'COBRANCA', 'ENTREGA', 'OUTRO'], {
    required_error: 'Selecione o tipo de endereço',
  }),
  enderecoPrincipal: z.enum(['SIM', 'NAO'], {
    required_error: 'Informe se é o endereço principal',
  }),
});

export type EnderecoFormData = z.infer<typeof enderecoSchema>;
