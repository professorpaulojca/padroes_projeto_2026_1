package br.umc.repositories;

import br.umc.models.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<UsuarioEntity, Long> {

    @Query(value = "SELECT * FROM usuarios WHERE email = :email", nativeQuery = true)
    Optional<UsuarioEntity> findByEmail(@Param("email") String email);

    @Query(value = "SELECT * FROM usuarios WHERE id = :id AND id_situacao != 3", nativeQuery = true)
    Optional<UsuarioEntity> findByIdAtivo(@Param("id") Long id);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE usuarios SET id_situacao = 3, ativo = false, atualizado_em = NOW() WHERE id = :id", nativeQuery = true)
    void softDelete(@Param("id") Long id);

    @Query(value = "SELECT * FROM usuarios WHERE email = :email AND id_situacao != 3", nativeQuery = true)
    Optional<UsuarioEntity> findByEmailAndAtivoTrue(@Param("email") String email);

    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM usuarios WHERE email = :email", nativeQuery = true)
    boolean existsByEmail(@Param("email") String email);

    @Query(value = "SELECT * FROM usuarios WHERE token_reset_senha = :token AND token_reset_expiracao > :agora", nativeQuery = true)
    Optional<UsuarioEntity> findByTokenResetSenhaAndTokenResetExpiracaoAfter(
            @Param("token") String token,
            @Param("agora") LocalDateTime agora);

    @Query(value = "SELECT * FROM usuarios WHERE id_situacao != 3 ORDER BY id", nativeQuery = true)
    List<UsuarioEntity> findAllAtivos();

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE usuarios SET senha = :senha, atualizado_em = NOW() WHERE id = :id", nativeQuery = true)
    void updateSenha(@Param("id") Long id, @Param("senha") String senha);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE usuarios SET token_reset_senha = :token, token_reset_expiracao = :expiracao, atualizado_em = NOW() WHERE id = :id", nativeQuery = true)
    void updateTokenReset(
            @Param("id") Long id,
            @Param("token") String token,
            @Param("expiracao") LocalDateTime expiracao);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE usuarios SET token_reset_senha = NULL, token_reset_expiracao = NULL, atualizado_em = NOW() WHERE id = :id", nativeQuery = true)
    void clearTokenReset(@Param("id") Long id);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE usuarios SET nome_exibicao = :nomeExibicao, perfil = :perfil, ativo = :ativo, atualizado_em = NOW() WHERE id = :id", nativeQuery = true)
    void updatePerfil(
            @Param("id") Long id,
            @Param("nomeExibicao") String nomeExibicao,
            @Param("perfil") String perfil,
            @Param("ativo") boolean ativo);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE usuarios SET pessoa_id = :pessoaId, atualizado_em = NOW() WHERE id = :id", nativeQuery = true)
    void updatePessoa(@Param("id") Long id, @Param("pessoaId") Long pessoaId);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE usuarios SET tentativas_falhas = :tentativas, bloqueado_ate = :bloqueadoAte, atualizado_em = NOW() WHERE id = :id", nativeQuery = true)
    void updateTentativasFalhas(@Param("id") Long id, @Param("tentativas") int tentativas, @Param("bloqueadoAte") LocalDateTime bloqueadoAte);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE usuarios SET tentativas_falhas = 0, bloqueado_ate = NULL, atualizado_em = NOW() WHERE id = :id", nativeQuery = true)
    void resetTentativasFalhas(@Param("id") Long id);
}
