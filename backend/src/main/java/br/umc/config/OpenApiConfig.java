package br.umc.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "API - Padrões de Projeto",
                version = "1.0",
                description = "API RESTful com autenticação JWT, gerenciamento de usuários, pessoas e endereços.",
                contact = @Contact(name = "UMC - Padrões de Projeto 2026/1")
        ),
        servers = @Server(url = "http://localhost:8080", description = "Servidor local")
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER,
        description = "Informe o token JWT obtido no endpoint /auth/login. Exemplo: Bearer eyJhbGci..."
)
public class OpenApiConfig {
}
