export interface Pessoa {
  id: number;
  nome: string;
  dataNascimento: string;
  idade: number;
  enderecos: Endereco[];
}

export interface PessoaRequest {
  nome: string;
  dataNascimento: string; // dd/MM/yyyy
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
