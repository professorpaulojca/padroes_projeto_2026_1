import { api } from '@/lib/axios';
import { createLogger } from '@/lib/logger';
import type { Usuario } from '@/types';

const log = createLogger('USUARIO_SERVICE');

interface AtualizarPerfilRequest {
  nomeExibicao: string;
  pessoaId?: number | null;
}

interface AlterarSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
}

export const usuarioService = {
  async listar(): Promise<Usuario[]> {
    log.info('Listando todos os usuários');
    const { data } = await api.get<Usuario[]>('/api/usuarios');
    return data;
  },

  async buscarPorId(id: number): Promise<Usuario> {
    log.info(`Buscando usuário id=${id}`);
    const { data } = await api.get<Usuario>(`/api/usuarios/${id}`);
    return data;
  },

  async buscarMeuPerfil(): Promise<Usuario> {
    log.info('Buscando perfil do usuário autenticado');
    const { data } = await api.get<Usuario>('/api/usuarios/me');
    return data;
  },

  async atualizarPerfil(id: number, perfil: AtualizarPerfilRequest): Promise<Usuario> {
    log.info(`Atualizando perfil do usuário id=${id}`);
    const { data } = await api.put<Usuario>(`/api/usuarios/${id}/perfil`, perfil);
    return data;
  },

  async alterarSenha(id: number, senhas: AlterarSenhaRequest): Promise<void> {
    log.info(`Alterando senha do usuário id=${id}`);
    await api.put(`/api/usuarios/${id}/senha`, senhas);
  },

  async desativar(id: number): Promise<void> {
    log.info(`Desativando usuário id=${id}`);
    await api.delete(`/api/usuarios/${id}`);
  },
};
