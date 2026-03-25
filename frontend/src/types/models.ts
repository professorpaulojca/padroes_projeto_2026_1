export interface Pessoa {
  id: number;
  nome: string;
  sobrenome: string | null;
  cpf: string | null;
  rg: string | null;
  dataNascimento: string;
  idade: number;
  sexo: string | null;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  observacoes: string | null;
  tipoSanguineo: string | null;
  estadoCivil: string | null;
  nacionalidade: string | null;
  naturalidade: string | null;
  profissao: string | null;
  empresa: string | null;
  enderecos: Endereco[];
  situacao: string;
}

export interface PessoaRequest {
  nome: string;
  sobrenome?: string;
  cpf?: string;
  rg?: string;
  dataNascimento: string; // dd/MM/yyyy
  sexo?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  observacoes?: string;
  tipoSanguineo?: string;
  estadoCivil?: string;
  nacionalidade?: string;
  naturalidade?: string;
  profissao?: string;
  empresa?: string;
}

export interface Endereco {
  id: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  tipoEndereco: TipoEndereco;
  enderecoPrincipal: EnderecoPrincipal;
  latitude: number | null;
  longitude: number | null;
  situacao: string;
}

export interface EnderecoRequest {
  cep: string;
  numero: string;
  complemento?: string;
  tipoEndereco: TipoEndereco;
  enderecoPrincipal: EnderecoPrincipal;
}

export type TipoEndereco = 'RESIDENCIAL' | 'COMERCIAL' | 'COBRANCA' | 'ENTREGA' | 'OUTRO';
export type EnderecoPrincipal = 'SIM' | 'NAO';
export type PerfilUsuario = 'ADMIN' | 'USUARIO';

export interface Usuario {
  id: number;
  email: string;
  nomeExibicao: string;
  perfil: string;
  ativo: boolean;
  pessoaId: number | null;
  pessoaNome: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export const TIPO_ENDERECO_LABELS: Record<TipoEndereco, string> = {
  RESIDENCIAL: 'Residencial',
  COMERCIAL: 'Comercial',
  COBRANCA: 'Cobrança',
  ENTREGA: 'Entrega',
  OUTRO: 'Outro',
};

export const ESTADOS_BR = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
];
