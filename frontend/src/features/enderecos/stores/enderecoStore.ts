import { create } from 'zustand';
import { createLogger } from '@/lib/logger';
import { enderecoService } from '../services';
import type { Endereco, EnderecoRequest } from '@/types';

const log = createLogger('ENDERECO_STORE');

interface EnderecoState {
  enderecos: Endereco[];
  enderecoSelecionado: Endereco | null;
  isLoading: boolean;
  error: string | null;
}

interface EnderecoActions {
  listar: () => Promise<void>;
  buscarPorCep: (cep: string) => Promise<void>;
  criar: (endereco: EnderecoRequest) => Promise<void>;
  atualizar: (id: number, endereco: EnderecoRequest) => Promise<void>;
  excluir: (id: number) => Promise<void>;
  selecionar: (endereco: Endereco | null) => void;
  clearError: () => void;
}

type EnderecoStore = EnderecoState & EnderecoActions;

const extractError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosErr = error as { response?: { data?: { erro?: string } } };
    if (axiosErr.response?.data?.erro) return axiosErr.response.data.erro;
  }
  if (error instanceof Error) return error.message;
  return 'Erro inesperado';
};

export const useEnderecoStore = create<EnderecoStore>((set) => ({
  enderecos: [],
  enderecoSelecionado: null,
  isLoading: false,
  error: null,

  listar: async () => {
    set({ isLoading: true, error: null });
    try {
      const enderecos = await enderecoService.listar();
      set({ enderecos, isLoading: false });
      log.info(`${enderecos.length} endereço(s) carregado(s)`);
    } catch (error) {
      const msg = extractError(error);
      log.error(`Erro ao listar endereços: ${msg}`);
      set({ isLoading: false, error: msg });
    }
  },

  buscarPorCep: async (cep: string) => {
    set({ isLoading: true, error: null });
    try {
      const enderecos = await enderecoService.buscarPorCep(cep);
      set({ enderecos, isLoading: false });
      log.info(`Busca CEP ${cep}: ${enderecos.length} resultado(s)`);
    } catch (error) {
      const msg = extractError(error);
      log.error(`Erro ao buscar por CEP: ${msg}`);
      set({ isLoading: false, error: msg });
    }
  },

  criar: async (endereco: EnderecoRequest) => {
    set({ isLoading: true, error: null });
    try {
      const novo = await enderecoService.criar(endereco);
      set((state) => ({
        enderecos: [...state.enderecos, novo],
        isLoading: false,
      }));
      log.info(`Endereço criado: id=${novo.id}`);
    } catch (error) {
      const msg = extractError(error);
      log.error(`Erro ao criar endereço: ${msg}`);
      set({ isLoading: false, error: msg });
      throw error;
    }
  },

  atualizar: async (id: number, endereco: EnderecoRequest) => {
    set({ isLoading: true, error: null });
    try {
      const atualizado = await enderecoService.atualizar(id, endereco);
      set((state) => ({
        enderecos: state.enderecos.map((e) => (e.id === id ? atualizado : e)),
        enderecoSelecionado: state.enderecoSelecionado?.id === id ? atualizado : state.enderecoSelecionado,
        isLoading: false,
      }));
      log.info(`Endereço atualizado: id=${id}`);
    } catch (error) {
      const msg = extractError(error);
      log.error(`Erro ao atualizar endereço: ${msg}`);
      set({ isLoading: false, error: msg });
      throw error;
    }
  },

  excluir: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await enderecoService.excluir(id);
      set((state) => ({
        enderecos: state.enderecos.filter((e) => e.id !== id),
        enderecoSelecionado: state.enderecoSelecionado?.id === id ? null : state.enderecoSelecionado,
        isLoading: false,
      }));
      log.info(`Endereço excluído: id=${id}`);
    } catch (error) {
      const msg = extractError(error);
      log.error(`Erro ao excluir endereço: ${msg}`);
      set({ isLoading: false, error: msg });
      throw error;
    }
  },

  selecionar: (endereco) => {
    set({ enderecoSelecionado: endereco });
  },

  clearError: () => set({ error: null }),
}));
