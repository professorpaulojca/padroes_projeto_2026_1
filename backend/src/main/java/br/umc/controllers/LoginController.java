// Define o pacote (pasta) onde esta classe está organizada dentro do projeto
package br.umc.controllers;

// Importa a classe Usuario que criamos, para poder usá-la aqui
import br.umc.models.Usuario;
// Importa ResponseEntity: é o objeto que representa a resposta HTTP (status + corpo)
import org.springframework.http.ResponseEntity;
// Importa a anotação que indica que este método responde a requisições POST
import org.springframework.web.bind.annotation.PostMapping;
// Importa a anotação que lê o JSON enviado pelo frontend e converte em objeto Java
import org.springframework.web.bind.annotation.RequestBody;
// Importa a anotação que define a URL base que esta classe vai atender
import org.springframework.web.bind.annotation.RequestMapping;
// Importa a anotação que transforma esta classe em um controller que responde JSON
import org.springframework.web.bind.annotation.RestController;

// Importa HashMap: uma estrutura de dados que armazena pares chave → valor (ex: "sucesso" → true)
import java.util.HashMap;
// Importa Map: é a interface (contrato) que HashMap implementa
import java.util.Map;

// Diz ao Spring que esta classe é um controller REST (recebe e responde requisições HTTP em JSON)
@RestController
// Define que todas as rotas desta classe começam com "/login"
@RequestMapping("/login")
public class LoginController {

    // Constante com o usuário válido — "static final" significa que o valor nunca muda
    private static final String USUARIO_VALIDO = "admin@email.com";
    // Constante com a senha válida
    private static final String SENHA_VALIDA = "123456";

    // Indica que este método responde a requisições HTTP do tipo POST em "/login"
    @PostMapping
    // Método público que retorna uma ResponseEntity contendo um Map (objeto JSON) como corpo
    // @RequestBody faz o Spring converter automaticamente o JSON recebido em um objeto Usuario
    public ResponseEntity<Map<String, Object>> login(@RequestBody Usuario usuario) {

        // Verifica se o campo usuario OU o campo senha não foram enviados (são nulos)
        if (usuario.getUsuario() == null || usuario.getSenha() == null) {
            // Retorna status 400 (Bad Request) com mensagem de erro
            return ResponseEntity.badRequest().body(resposta(false, "Usuário e senha são obrigatórios."));
        }

        // Verifica se o usuario E a senha conferem com os valores válidos
        if (USUARIO_VALIDO.equals(usuario.getUsuario()) && SENHA_VALIDA.equals(usuario.getSenha())) {
            // Retorna status 200 (OK) com mensagem de sucesso
            return ResponseEntity.ok(resposta(true, "Acesso liberado."));
        }

        // Se chegou até aqui, as credenciais estão erradas — retorna status 401 (Unauthorized)
        return ResponseEntity.status(401).body(resposta(false, "Usuário ou senha inválidos."));
    }

    // Método auxiliar privado (só usado dentro desta classe) que monta o objeto de resposta JSON
    private Map<String, Object> resposta(boolean sucesso, String mensagem) {
        // Cria um HashMap vazio para armazenar os dados da resposta
        Map<String, Object> map = new HashMap<>();
        // Adiciona a chave "sucesso" com valor true ou false
        map.put("sucesso", sucesso);
        // Adiciona a chave "mensagem" com o texto explicativo
        map.put("mensagem", mensagem);
        // Retorna o map montado — ele será convertido para JSON automaticamente pelo Spring
        return map;
    }
}
