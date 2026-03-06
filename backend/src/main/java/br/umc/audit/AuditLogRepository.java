package br.umc.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogEntity, Long> {

    @Query(value = """
            SELECT * FROM audit_logs
            WHERE usuario_email = :email
            ORDER BY criado_em DESC
            LIMIT :limite
            """, nativeQuery = true)
    List<AuditLogEntity> findByUsuarioEmail(
            @Param("email") String email,
            @Param("limite") int limite);

    @Query(value = """
            SELECT * FROM audit_logs
            WHERE acao = :acao
            ORDER BY criado_em DESC
            LIMIT :limite
            """, nativeQuery = true)
    List<AuditLogEntity> findByAcao(
            @Param("acao") String acao,
            @Param("limite") int limite);

    @Query(value = """
            SELECT * FROM audit_logs
            WHERE entidade = :entidade AND entidade_id = :entidadeId
            ORDER BY criado_em DESC
            """, nativeQuery = true)
    List<AuditLogEntity> findHistoricoEntidade(
            @Param("entidade") String entidade,
            @Param("entidadeId") String entidadeId);

    @Query(value = """
            SELECT * FROM audit_logs
            WHERE criado_em BETWEEN :inicio AND :fim
            ORDER BY criado_em DESC
            """, nativeQuery = true)
    List<AuditLogEntity> findByPeriodo(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim);

    @Query(value = """
            SELECT * FROM audit_logs
            WHERE sucesso = false
            ORDER BY criado_em DESC
            LIMIT :limite
            """, nativeQuery = true)
    List<AuditLogEntity> findFalhas(@Param("limite") int limite);

    @Modifying
    @Query(value = """
            DELETE FROM audit_logs
            WHERE criado_em < :antes
            """, nativeQuery = true)
    int deletarLogsAntigos(@Param("antes") LocalDateTime antes);

    @Query(value = """
            SELECT COUNT(*) FROM audit_logs
            WHERE acao = :acao
            AND criado_em >= :desde
            """, nativeQuery = true)
    long contarPorAcaoDesde(
            @Param("acao") String acao,
            @Param("desde") LocalDateTime desde);
}
