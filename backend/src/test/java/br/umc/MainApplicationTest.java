package br.umc;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class MainApplicationTest {

    @Test
    @DisplayName("Contexto Spring deve carregar com sucesso")
    void contextLoads() {
    }
}
