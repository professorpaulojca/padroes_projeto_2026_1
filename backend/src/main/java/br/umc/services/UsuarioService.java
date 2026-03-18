package br.umc.services;

import br.umc.dto.usuario.AlterarSenhaRequestDTO;
import br.umc.dto.usuario.AtualizarPerfilRequestDTO;
import br.umc.dto.usuario.UsuarioResponseDTO;
import br.umc.models.PessoaEntity;
import br.umc.models.PerfilUsuario;
import br.umc.models.UsuarioEntity;
import br.umc.repositories.PessoaJpaRepository;
import br.umc.repositories.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);

    private final UsuarioRepository usuarioRepository;
    private final PessoaJpaRepository pessoaJpaRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          PessoaJpaRepository pessoaJpaRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.pessoaJpaRepository = pessoaJpaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(Long id) {
        log.debug("[USUARIO] Buscando usuário por ID: {}", id);
        UsuarioEntity usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("[USUARIO] Usuário não encontrado: id={}", id);
                    return new IllegalArgumentException("Usuário não encontrado: " + id);
                });
        return UsuarioResponseDTO.fromEntity(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorEmail(String email) {
        UsuarioEntity usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + email));
        return UsuarioResponseDTO.fromEntity(usuario);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        log.debug("[USUARIO] Listando todos os usuários ativos");
        return usuarioRepository.findAllAtivos()
                .stream()
                .map(UsuarioResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UsuarioResponseDTO atualizarPerfil(Long id, AtualizarPerfilRequestDTO dto, String emailAutenticado) {
        log.info("[USUARIO] Atualizando perfil: id={} | solicitante={}", id, emailAutenticado);
        UsuarioEntity usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + id));

        verificarAutorizacao(usuario, emailAutenticado);

        PessoaEntity pessoa = null;
        if (dto.getPessoaId() != null) {
            pessoa = pessoaJpaRepository.findById(dto.getPessoaId())
                    .orElseThrow(() -> new IllegalArgumentException("Pessoa não encontrada: " + dto.getPessoaId()));
        }

        usuarioRepository.updatePerfil(id, dto.getNomeExibicao(), usuario.getPerfil().name(), usuario.isAtivo());

        if (pessoa != null) {
            usuarioRepository.updatePessoa(id, pessoa.getId());
        }

        return UsuarioResponseDTO.fromEntity(usuarioRepository.findById(id).orElseThrow());
    }

    @Transactional
    public void alterarSenha(Long id, AlterarSenhaRequestDTO dto, String emailAutenticado) {
        log.info("[USUARIO] Alteração de senha solicitada: id={} | solicitante={}", id, emailAutenticado);
        UsuarioEntity usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + id));

        verificarAutorizacao(usuario, emailAutenticado);

        if (!passwordEncoder.matches(dto.getSenhaAtual(), usuario.getSenha())) {
            log.warn("[USUARIO] Senha atual incorreta: id={}", id);
            throw new IllegalArgumentException("Senha atual incorreta");
        }

        usuarioRepository.updateSenha(id, passwordEncoder.encode(dto.getNovaSenha()));
        log.info("[USUARIO] Senha alterada com sucesso: id={}", id);
    }

    @Transactional
    public void desativarUsuario(Long id, String emailAutenticado) {
        log.info("[USUARIO] Desativando usuário: id={} | solicitante={}", id, emailAutenticado);
        UsuarioEntity usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + id));

        UsuarioEntity autenticado = usuarioRepository.findByEmail(emailAutenticado)
                .orElseThrow(() -> new IllegalArgumentException("Usuário autenticado não encontrado"));

        if (!autenticado.getPerfil().equals(PerfilUsuario.ADMIN) && !autenticado.getId().equals(id)) {
            throw new AccessDeniedException("Acesso negado");
        }

        usuarioRepository.updatePerfil(id, usuario.getNomeExibicao(), usuario.getPerfil().name(), false);
    }

    private void verificarAutorizacao(UsuarioEntity alvo, String emailAutenticado) {
        UsuarioEntity autenticado = usuarioRepository.findByEmail(emailAutenticado)
                .orElseThrow(() -> new IllegalArgumentException("Usuário autenticado não encontrado"));

        if (!autenticado.getPerfil().equals(PerfilUsuario.ADMIN)
                && !autenticado.getId().equals(alvo.getId())) {
            throw new AccessDeniedException("Acesso negado: você só pode modificar seu próprio perfil");
        }
    }
}
