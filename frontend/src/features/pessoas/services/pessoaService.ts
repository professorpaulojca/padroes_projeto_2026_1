import { api } from '@/lib/axios';
import { createLogger } from '@/lib/logger';
import type { Pessoa, PessoaRequest, Endereco, EnderecoRequest } from '@/types';

const log = createLogger('PESSOA_SERVICE');

export const pessoaService = {
  async listar(): Promise<Pessoa[]> {
    log.info('Listando todas as pessoas');
    const { data } = await api.get<Pessoa[]>('/api/pessoas');
    return data;
  },

  async buscarPorId(id: number): Promise<Pessoa> {
    log.info(`Buscando pessoa id=${id}`);
    const { data } = await api.get<Pessoa>(`/api/pessoas/${id}`);
    return data;
  },

  async buscarPorNome(nome: string): Promise<Pessoa[]> {
    log.info(`Buscando pessoas por nome: "${nome}"`);
    const { data } = await api.get<Pessoa[]>('/api/pessoas/buscar', { params: { nome } });
    return data;
  },

  async criar(pessoa: PessoaRequest): Promise<Pessoa> {
    log.info(`Criando pessoa: nome=${pessoa.nome}`);
    const { data } = await api.post<Pessoa>('/api/pessoas', pessoa);
    return data;
  },

  async atualizar(id: number, pessoa: PessoaRequest): Promise<Pessoa> {
    log.info(`Atualizando pessoa id=${id}`);
    const { data } = await api.put<Pessoa>(`/api/pessoas/${id}`, pessoa);
    return data;
  },

  async excluir(id: number): Promise<void> {
    log.info(`Excluindo pessoa id=${id}`);
    await api.delete(`/api/pessoas/${id}`);
  },

  async listarEnderecos(pessoaId: number): Promise<Endereco[]> {
    log.info(`Listando endereços da pessoa id=${pessoaId}`);
    const { data } = await api.get<Endereco[]>(`/api/pessoas/${pessoaId}/enderecos`);
    return data;
  },

  async vincularEnderecos(pessoaId: number, enderecos: EnderecoRequest[]): Promise<Pessoa> {
    log.info(`Vinculando ${enderecos.length} endereço(s) à pessoa id=${pessoaId}`);
    const { data } = await api.post<Pessoa>(`/api/pessoas/${pessoaId}/enderecos`, enderecos);
    return data;
  },

  async desvincularEndereco(pessoaId: number, enderecoId: number): Promise<void> {
    log.info(`Desvinculando endereço id=${enderecoId} da pessoa id=${pessoaId}`);
    await api.delete(`/api/pessoas/${pessoaId}/enderecos/${enderecoId}`);
  },
};
