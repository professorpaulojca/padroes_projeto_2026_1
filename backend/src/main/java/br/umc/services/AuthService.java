package br.umc.services;

import br.umc.audit.AuditAction;
import br.umc.audit.AuditContext;
import br.umc.audit.AuditLogBuilder;
import br.umc.audit.AuditLogService;
import br.umc.dto.auth.*;
import br.umc.metrics.MetricsService;
import br.umc.models.PerfilUsuario;
import br.umc.models.UsuarioEntity;
import br.umc.repositories.UsuarioRepository;
import br.umc.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int MAX_TENTATIVAS_FALHAS = 5;
    private static final int MINUTOS_BLOQUEIO = 15;

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final MetricsService metricsService;
    private final AuditLogService auditLogService;

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       MetricsService metricsService,
                       AuditLogService auditLogService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.metricsService = metricsService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public LoginResponseDTO login(LoginRequestDTO dto) {
        long inicio = System.currentTimeMillis();

        // Verificar se a conta está bloqueada
        usuarioRepository.findByEmailAndAtivoTrue(dto.getEmail()).ifPresent(usuario -> {
            if (usuario.getBloqueadoAte() != null && LocalDateTime.now().isBefore(usuario.getBloqueadoAte())) {
                long minutosRestantes = java.time.Duration.between(LocalDateTime.now(), usuario.getBloqueadoAte()).toMinutes() + 1;
                log.warn("[AUTH] Conta bloqueada: email={} | bloqueado_ate={}", dto.getEmail(), usuario.getBloqueadoAte());
                throw new BadCredentialsException("Conta temporariamente bloqueada. Tente novamente em " + minutosRestantes + " minutos.");
            }
        });

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getSenha())
            );
            UsuarioEntity usuario = (UsuarioEntity) authentication.getPrincipal();

            // Login bem-sucedido: resetar tentativas
            if (usuario.getTentativasFalhas() > 0) {
                usuarioRepository.resetTentativasFalhas(usuario.getId());
            }

            String token = jwtUtil.gerarToken(usuario);

            metricsService.registrarLoginSucesso();
            log.info("[AUTH] Login bem-sucedido: email={} | perfil={} | ip={}",
                    usuario.getEmail(), usuario.getPerfil(), AuditContext.getIp());

            auditLogService.registrar(AuditLogBuilder.novo()
                    .fromContext()
                    .acao(AuditAction.LOGIN)
                    .entidade("Usuario")
                    .entidadeId(usuario.getId())
                    .usuario(usuario.getEmail(), usuario.getPerfil().name())
                    .detalhe("Login realizado com sucesso")
                    .sucesso()
                    .duracao(System.currentTimeMillis() - inicio));

            return new LoginResponseDTO(token, usuario.getEmail(),
                    usuario.getNomeExibicao(), usuario.getPerfil().name());

        } catch (Exception e) {
            metricsService.registrarLoginFalha();

            // Incrementar tentativas de falha e bloquear se necessário
            usuarioRepository.findByEmailAndAtivoTrue(dto.getEmail()).ifPresent(usuario -> {
                int tentativas = usuario.getTentativasFalhas() + 1;
                LocalDateTime bloqueadoAte = null;
                if (tentativas >= MAX_TENTATIVAS_FALHAS) {
                    bloqueadoAte = LocalDateTime.now().plusMinutes(MINUTOS_BLOQUEIO);
                    log.warn("[AUTH] Conta bloqueada por {} minutos: email={} | tentativas={}",
                            MINUTOS_BLOQUEIO, dto.getEmail(), tentativas);
                }
                usuarioRepository.updateTentativasFalhas(usuario.getId(), tentativas, bloqueadoAte);
            });

            log.warn("[AUTH] Falha no login: email={} | ip={} | motivo={}",
                    dto.getEmail(), AuditContext.getIp(), e.getMessage());

            auditLogService.registrar(AuditLogBuilder.novo()
                    .fromContext()
                    .acao(AuditAction.LOGIN)
                    .entidade("Usuario")
                    .usuario(dto.getEmail(), null)
                    .falha("Credenciais inválidas: " + e.getMessage())
                    .duracao(System.currentTimeMillis() - inicio));

            throw new BadCredentialsException("E-mail ou senha inválidos");
        }
    }

    @Transactional
    public LoginResponseDTO cadastrar(CadastroRequestDTO dto) {
        log.info("[AUTH] Tentativa de cadastro: email={}", dto.getEmail());
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            log.warn("[AUTH] Cadastro rejeitado - e-mail já cadastrado: {}", dto.getEmail());
            throw new IllegalArgumentException("E-mail já cadastrado: " + dto.getEmail());
        }

        UsuarioEntity usuario = new UsuarioEntity();
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        usuario.setNomeExibicao(dto.getNomeExibicao());
        usuario.setPerfil(PerfilUsuario.USUARIO);

        usuario = usuarioRepository.save(usuario);
        log.info("[AUTH] Cadastro realizado com sucesso: email={} | id={}", usuario.getEmail(), usuario.getId());

        String token = jwtUtil.gerarToken(usuario);
        return new LoginResponseDTO(
                token,
                usuario.getEmail(),
                usuario.getNomeExibicao(),
                usuario.getPerfil().name()
        );
    }

    @Transactional
    public void esqueciSenha(EsqueciSenhaRequestDTO dto) {
        log.info("[AUTH] Solicitação de redefinição de senha: email={}", dto.getEmail());
        UsuarioEntity usuario = usuarioRepository.findByEmailAndAtivoTrue(dto.getEmail())
                .orElseThrow(() -> {
                    log.warn("[AUTH] E-mail não encontrado para redefinição: {}", dto.getEmail());
                    return new IllegalArgumentException("E-mail não encontrado");
                });

        // Invalidar tokens anteriores gerando um novo
        String token = jwtUtil.gerarTokenResetSenha();
        LocalDateTime expiracao = LocalDateTime.now().plusMinutes(15);

        usuarioRepository.updateTokenReset(usuario.getId(), token, expiracao);

        // Em produção, enviar o token por e-mail aqui
        // emailService.enviarTokenResetSenha(usuario.getEmail(), token);

        log.info("[AUTH] Token de redefinição gerado e armazenado para: email={}", dto.getEmail());
    }

    @Transactional
    public void redefinirSenha(RedefinirSenhaRequestDTO dto) {
        log.info("[AUTH] Tentativa de redefinição de senha com token");
        UsuarioEntity usuario = usuarioRepository
                .findByTokenResetSenhaAndTokenResetExpiracaoAfter(dto.getToken(), LocalDateTime.now())
                .orElseThrow(() -> {
                    log.warn("[AUTH] Token de redefinição inválido ou expirado");
                    return new IllegalArgumentException("Token inválido ou expirado");
                });

        usuarioRepository.updateSenha(usuario.getId(), passwordEncoder.encode(dto.getNovaSenha()));
        usuarioRepository.clearTokenReset(usuario.getId());
        log.info("[AUTH] Senha redefinida com sucesso: email={}", usuario.getEmail());
    }
}
