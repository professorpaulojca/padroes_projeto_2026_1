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

    @Query(value = "SELECT * FROM pessoas WHERE LOWER(nome) = LOWER(:nome)", nativeQuery = true)
    Optional<PessoaEntity> findByNomeIgnoreCase(@Param("nome") String nome);

    @Query(value = "SELECT * FROM pessoas WHERE LOWER(nome) LIKE LOWER(CONCAT('%', :nome, '%')) ORDER BY nome", nativeQuery = true)
    List<PessoaEntity> findByNomeContainingIgnoreCase(@Param("nome") String nome);

    @Query(value = "SELECT * FROM pessoas ORDER BY nome", nativeQuery = true)
    List<PessoaEntity> findAllOrderByNome();

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE pessoas SET nome = :nome, data_nascimento = :dataNascimento, atualizado_em = NOW() WHERE id = :id", nativeQuery = true)
    void updatePessoa(
            @Param("id") Long id,
            @Param("nome") String nome,
            @Param("dataNascimento") LocalDate dataNascimento);

    @Modifying
    @Query(value = "DELETE FROM pessoas_enderecos WHERE pessoa_id = :pessoaId AND endereco_id = :enderecoId", nativeQuery = true)
    void desvincularEndereco(@Param("pessoaId") Long pessoaId, @Param("enderecoId") Long enderecoId);

    @Modifying
    @Query(value = "INSERT INTO pessoas_enderecos (pessoa_id, endereco_id) VALUES (:pessoaId, :enderecoId) ON CONFLICT DO NOTHING", nativeQuery = true)
    void vincularEndereco(@Param("pessoaId") Long pessoaId, @Param("enderecoId") Long enderecoId);

    @Query(value = """
            SELECT p.* FROM pessoas p
            INNER JOIN pessoas_enderecos pe ON p.id = pe.pessoa_id
            WHERE pe.endereco_id = :enderecoId
            ORDER BY p.nome
            """, nativeQuery = true)
    List<PessoaEntity> findByEnderecoId(@Param("enderecoId") Long enderecoId);
}
