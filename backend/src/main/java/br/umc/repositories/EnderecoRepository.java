package br.umc.repositories;

import br.umc.models.EnderecoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnderecoRepository extends JpaRepository<EnderecoEntity, Long> {

    @Query(value = "SELECT * FROM enderecos WHERE cep = :cep ORDER BY logradouro", nativeQuery = true)
    List<EnderecoEntity> findByCep(@Param("cep") String cep);

    @Query(value = "SELECT * FROM enderecos WHERE cep = :cep AND numero = :numero AND LOWER(complemento) = LOWER(:complemento)", nativeQuery = true)
    Optional<EnderecoEntity> findByCepAndNumeroAndComplemento(
            @Param("cep") String cep,
            @Param("numero") String numero,
            @Param("complemento") String complemento);

    @Query(value = "SELECT * FROM enderecos WHERE cep = :cep AND numero = :numero AND complemento IS NULL", nativeQuery = true)
    Optional<EnderecoEntity> findByCepAndNumeroSemComplemento(
            @Param("cep") String cep,
            @Param("numero") String numero);

    @Query(value = "SELECT * FROM enderecos ORDER BY logradouro, numero", nativeQuery = true)
    List<EnderecoEntity> findAllOrderByLogradouro();

    @Query(value = """
            SELECT e.* FROM enderecos e
            INNER JOIN pessoas_enderecos pe ON e.id = pe.endereco_id
            WHERE pe.pessoa_id = :pessoaId
            ORDER BY e.logradouro
            """, nativeQuery = true)
    List<EnderecoEntity> findByPessoaId(@Param("pessoaId") Long pessoaId);

    @Query(value = "SELECT * FROM enderecos WHERE LOWER(cidade) = LOWER(:cidade) ORDER BY logradouro", nativeQuery = true)
    List<EnderecoEntity> findByCidadeIgnoreCase(@Param("cidade") String cidade);

    @Query(value = "SELECT * FROM enderecos WHERE LOWER(estado) = LOWER(:estado) ORDER BY cidade, logradouro", nativeQuery = true)
    List<EnderecoEntity> findByEstadoIgnoreCase(@Param("estado") String estado);

    @Modifying
    @Query(value = """
            UPDATE enderecos SET
                cep = :cep,
                logradouro = :logradouro,
                numero = :numero,
                complemento = :complemento,
                bairro = :bairro,
                cidade = :cidade,
                estado = :estado,
                pais = :pais,
                tipo_endereco = :tipoEndereco,
                endereco_principal = :enderecoPrincipal,
                latitude = :latitude,
                longitude = :longitude,
                atualizado_em = NOW()
            WHERE id = :id
            """, nativeQuery = true)
    void updateEndereco(
            @Param("id") Long id,
            @Param("cep") String cep,
            @Param("logradouro") String logradouro,
            @Param("numero") String numero,
            @Param("complemento") String complemento,
            @Param("bairro") String bairro,
            @Param("cidade") String cidade,
            @Param("estado") String estado,
            @Param("pais") String pais,
            @Param("tipoEndereco") String tipoEndereco,
            @Param("enderecoPrincipal") String enderecoPrincipal,
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude);
}
