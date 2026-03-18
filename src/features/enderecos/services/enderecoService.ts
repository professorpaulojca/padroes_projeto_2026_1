import { api } from '@/lib/axios';
import { createLogger } from '@/lib/logger';
import type { Endereco, EnderecoRequest } from '@/types';

const log = createLogger('ENDERECO_SERVICE');

export const enderecoService = {
  async listar(): Promise<Endereco[]> {
    log.info('Listando todos os endereços');
    const { data } = await api.get<Endereco[]>('/api/enderecos');
    return data;
  },

  async buscarPorId(id: number): Promise<Endereco> {
    log.info(`Buscando endereço id=${id}`);
    const { data } = await api.get<Endereco>(`/api/enderecos/${id}`);
    return data;
  },

  async buscarPorCep(cep: string): Promise<Endereco[]> {
    log.info(`Buscando endereços por CEP: ${cep}`);
    const { data } = await api.get<Endereco[]>('/api/enderecos/buscar', { params: { cep } });
    return data;
  },

  async criar(endereco: EnderecoRequest): Promise<Endereco> {
    log.info(`Criando endereço: CEP=${endereco.cep}`);
    const { data } = await api.post<Endereco>('/api/enderecos', endereco);
    return data;
  },

  async atualizar(id: number, endereco: EnderecoRequest): Promise<Endereco> {
    log.info(`Atualizando endereço id=${id}`);
    const { data } = await api.put<Endereco>(`/api/enderecos/${id}`, endereco);
    return data;
  },

  async excluir(id: number): Promise<void> {
    log.info(`Excluindo endereço id=${id}`);
    await api.delete(`/api/enderecos/${id}`);
  },
};
