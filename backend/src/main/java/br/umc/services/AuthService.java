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
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getSenha())
            );
            UsuarioEntity usuario = (UsuarioEntity) authentication.getPrincipal();
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
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("E-mail já cadastrado: " + dto.getEmail());
        }

        UsuarioEntity usuario = new UsuarioEntity();
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        usuario.setNomeExibicao(dto.getNomeExibicao());
        usuario.setPerfil(PerfilUsuario.USUARIO);

        usuario = usuarioRepository.save(usuario);

        String token = jwtUtil.gerarToken(usuario);
        return new LoginResponseDTO(
                token,
                usuario.getEmail(),
                usuario.getNomeExibicao(),
                usuario.getPerfil().name()
        );
    }

    @Transactional
    public String esqueciSenha(EsqueciSenhaRequestDTO dto) {
        UsuarioEntity usuario = usuarioRepository.findByEmailAndAtivoTrue(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("E-mail não encontrado: " + dto.getEmail()));

        String token = jwtUtil.gerarTokenResetSenha();
        LocalDateTime expiracao = LocalDateTime.now().plusHours(1);

        usuarioRepository.updateTokenReset(usuario.getId(), token, expiracao);

        return token;
    }

    @Transactional
    public void redefinirSenha(RedefinirSenhaRequestDTO dto) {
        UsuarioEntity usuario = usuarioRepository
                .findByTokenResetSenhaAndTokenResetExpiracaoAfter(dto.getToken(), LocalDateTime.now())
                .orElseThrow(() -> new IllegalArgumentException("Token inválido ou expirado"));

        usuarioRepository.updateSenha(usuario.getId(), passwordEncoder.encode(dto.getNovaSenha()));
        usuarioRepository.clearTokenReset(usuario.getId());
    }
}
