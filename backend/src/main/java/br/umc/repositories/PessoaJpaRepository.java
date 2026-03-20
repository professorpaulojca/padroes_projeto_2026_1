package br.umc.repositories;

import br.umc.models.PessoaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PessoaJpaRepository extends JpaRepository<PessoaEntity, Long> {

    @Query(value = "SELECT * FROM pessoas WHERE LOWER(nome) = LOWER(:nome) AND id_situacao != 3", nativeQuery = true)
    Optional<PessoaEntity> findByNomeIgnoreCase(@Param("nome") String nome);

    @Query(value = "SELECT * FROM pessoas WHERE LOWER(nome) LIKE LOWER(CONCAT('%', :nome, '%')) AND id_situacao != 3 ORDER BY nome", nativeQuery = true)
    List<PessoaEntity> findByNomeContainingIgnoreCase(@Param("nome") String nome);

    @Query(value = "SELECT * FROM pessoas WHERE id_situacao != 3 ORDER BY nome", nativeQuery = true)
    List<PessoaEntity> findAllOrderByNome();

    @Query(value = "SELECT * FROM pessoas WHERE id = :id AND id_situacao != 3", nativeQuery = true)
    Optional<PessoaEntity> findByIdAtivo(@Param("id") Long id);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE pessoas SET id_situacao = 3, atualizado_em = NOW() WHERE id = :id", nativeQuery = true)
    void softDelete(@Param("id") Long id);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE pessoas SET nome = :nome, data_nascimento = :dataNascimento, atualizado_em = NOW() WHERE id = :id", nativeQuery = true)
    void updatePessoa(
            @Param("id") Long id,
            @Param("nome") String nome,
            @Param("dataNascimento") LocalDate dataNascimento);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE pessoas_enderecos SET ativo = false WHERE pessoa_id = :pessoaId AND endereco_id = :enderecoId", nativeQuery = true)
    void desvincularEndereco(@Param("pessoaId") Long pessoaId, @Param("enderecoId") Long enderecoId);

    @Modifying(clearAutomatically = true)
    @Query(value = "INSERT INTO pessoas_enderecos (pessoa_id, endereco_id, ativo) VALUES (:pessoaId, :enderecoId, true) ON CONFLICT (pessoa_id, endereco_id) DO UPDATE SET ativo = true", nativeQuery = true)
    void vincularEndereco(@Param("pessoaId") Long pessoaId, @Param("enderecoId") Long enderecoId);

    @Query(value = """
            SELECT p.* FROM pessoas p
            INNER JOIN pessoas_enderecos pe ON p.id = pe.pessoa_id
            WHERE pe.endereco_id = :enderecoId AND pe.ativo = true
            ORDER BY p.nome
            """, nativeQuery = true)
    List<PessoaEntity> findByEnderecoId(@Param("enderecoId") Long enderecoId);
}
