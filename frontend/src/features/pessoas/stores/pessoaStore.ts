import { create } from 'zustand';
import { createLogger } from '@/lib/logger';
import { pessoaService } from '../services';
import type { Pessoa, PessoaRequest } from '@/types';

const log = createLogger('PESSOA_STORE');

interface PessoaState {
  pessoas: Pessoa[];
  pessoaSelecionada: Pessoa | null;
  isLoading: boolean;
  error: string | null;
}

interface PessoaActions {
  listar: () => Promise<void>;
  buscarPorNome: (nome: string) => Promise<void>;
  criar: (pessoa: PessoaRequest) => Promise<void>;
  atualizar: (id: number, pessoa: PessoaRequest) => Promise<void>;
  excluir: (id: number) => Promise<void>;
  selecionar: (pessoa: Pessoa | null) => void;
  clearError: () => void;
}

type PessoaStore = PessoaState & PessoaActions;

const extractError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosErr = error as { response?: { data?: { erro?: string } } };
    if (axiosErr.response?.data?.erro) return axiosErr.response.data.erro;
  }
  if (error instanceof Error) return error.message;
  return 'Erro inesperado';
};

export const usePessoaStore = create<PessoaStore>((set) => ({
  pessoas: [],
  pessoaSelecionada: null,
  isLoading: false,
  error: null,

  listar: async () => {
    set({ isLoading: true, error: null });
    try {
      const pessoas = await pessoaService.listar();
      set({ pessoas, isLoading: false });
      log.info(`${pessoas.length} pessoa(s) carregada(s)`);
    } catch (error) {
      const msg = extractError(error);
      log.error(`Erro ao listar pessoas: ${msg}`);
      set({ isLoading: false, error: msg });
    }
  },

  buscarPorNome: async (nome: string) => {
    set({ isLoading: true, error: null });
    try {
      const pessoas = await pessoaService.buscarPorNome(nome);
      set({ pessoas, isLoading: false });
      log.info(`Busca "${nome}": ${pessoas.length} resultado(s)`);
    } catch (error) {
      const msg = extractError(error);
      log.error(`Erro ao buscar pessoas: ${msg}`);
      set({ isLoading: false, error: msg });
    }
  },

  criar: async (pessoa: PessoaRequest) => {
    set({ isLoading: true, error: null });
    try {
      const nova = await pessoaService.criar(pessoa);
      set((state) => ({
        pessoas: [...state.pessoas, nova],
        isLoading: false,
      }));
      log.info(`Pessoa criada: id=${nova.id} nome=${nova.nome}`);
    } catch (error) {
      const msg = extractError(error);
      log.error(`Erro ao criar pessoa: ${msg}`);
      set({ isLoading: false, error: msg });
      throw error;
    }
  },

  atualizar: async (id: number, pessoa: PessoaRequest) => {
    set({ isLoading: true, error: null });
    try {
      const atualizada = await pessoaService.atualizar(id, pessoa);
      set((state) => ({
        pessoas: state.pessoas.map((p) => (p.id === id ? atualizada : p)),
        pessoaSelecionada: state.pessoaSelecionada?.id === id ? atualizada : state.pessoaSelecionada,
        isLoading: false,
      }));
      log.info(`Pessoa atualizada: id=${id}`);
    } catch (error) {
      const msg = extractError(error);
      log.error(`Erro ao atualizar pessoa: ${msg}`);
      set({ isLoading: false, error: msg });
      throw error;
    }
  },

  excluir: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await pessoaService.excluir(id);
      set((state) => ({
        pessoas: state.pessoas.filter((p) => p.id !== id),
        pessoaSelecionada: state.pessoaSelecionada?.id === id ? null : state.pessoaSelecionada,
        isLoading: false,
      }));
      log.info(`Pessoa excluída: id=${id}`);
    } catch (error) {
      const msg = extractError(error);
      log.error(`Erro ao excluir pessoa: ${msg}`);
      set({ isLoading: false, error: msg });
      throw error;
    }
  },

  selecionar: (pessoa) => {
    set({ pessoaSelecionada: pessoa });
  },

  clearError: () => set({ error: null }),
}));
