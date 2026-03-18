package br.umc.config;

import br.umc.models.PerfilUsuario;
import br.umc.models.UsuarioEntity;
import br.umc.repositories.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String emailAdmin = "admin@email.com";

        if (usuarioRepository.existsByEmail(emailAdmin)) {
            log.info("[INIT] Usuário admin já existe, pulando criação.");
            return;
        }

        UsuarioEntity admin = new UsuarioEntity();
        admin.setEmail(emailAdmin);
        admin.setSenha(passwordEncoder.encode("123456"));
        admin.setNomeExibicao("Administrador");
        admin.setPerfil(PerfilUsuario.ADMIN);

        usuarioRepository.save(admin);
        log.info("[INIT] Usuário admin criado com sucesso.");
    }
}
