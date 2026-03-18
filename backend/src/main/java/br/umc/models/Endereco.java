package br.umc.models;

import br.umc.models.valueObjects.Bairro;
import br.umc.models.valueObjects.Cep;
import br.umc.models.valueObjects.Cidade;
import br.umc.models.valueObjects.Complemento;
import br.umc.models.valueObjects.EnderecoPrincipalVO;
import br.umc.models.valueObjects.Estado;
import br.umc.models.valueObjects.Geolocalizacao;
import br.umc.models.valueObjects.Logradouro;
import br.umc.models.valueObjects.Numero;
import br.umc.models.valueObjects.Pais;
import br.umc.models.valueObjects.TipoEnderecoVO;

import java.util.Objects;

public class Endereco {

    private final Cep cep;
    private final Numero numero;
    private final Complemento complemento;
    private final Logradouro logradouro;
    private final TipoEnderecoVO tipoEndereco;
    private final EnderecoPrincipalVO enderecoPrincipal;
    private final Bairro bairro;
    private final Cidade cidade;
    private final Estado estado;
    private final Pais pais;
    private final Geolocalizacao geolocalizacao;

    public Endereco(Cep cep, Numero numero, Complemento complemento, Logradouro logradouro,
                    TipoEnderecoVO tipoEndereco, EnderecoPrincipalVO enderecoPrincipal,
                    Bairro bairro, Cidade cidade, Estado estado, Pais pais,
                    Geolocalizacao geolocalizacao) {
        if (cep == null) throw new IllegalArgumentException("CEP não pode ser nulo");
        if (numero == null) throw new IllegalArgumentException("Número não pode ser nulo");
        if (logradouro == null) throw new IllegalArgumentException("Logradouro não pode ser nulo");
        if (tipoEndereco == null) throw new IllegalArgumentException("Tipo de endereço não pode ser nulo");
        if (enderecoPrincipal == null) throw new IllegalArgumentException("Endereço principal não pode ser nulo");
        if (bairro == null) throw new IllegalArgumentException("Bairro não pode ser nulo");
        if (cidade == null) throw new IllegalArgumentException("Cidade não pode ser nula");
        if (estado == null) throw new IllegalArgumentException("Estado não pode ser nulo");
        if (pais == null) throw new IllegalArgumentException("País não pode ser nulo");

        this.cep = cep;
        this.numero = numero;
        this.complemento = complemento;
        this.logradouro = logradouro;
        this.tipoEndereco = tipoEndereco;
        this.enderecoPrincipal = enderecoPrincipal;
        this.bairro = bairro;
        this.cidade = cidade;
        this.estado = estado;
        this.pais = pais;
        this.geolocalizacao = geolocalizacao != null ? geolocalizacao : new Geolocalizacao(null, null);
    }

    public Cep getCep() {
        return cep;
    }

    public Numero getNumero() {
        return numero;
    }

    public Complemento getComplemento() {
        return complemento;
    }

    public Logradouro getLogradouro() {
        return logradouro;
    }

    public TipoEnderecoVO getTipoEndereco() {
        return tipoEndereco;
    }

    public EnderecoPrincipalVO getEnderecoPrincipal() {
        return enderecoPrincipal;
    }

    public Bairro getBairro() {
        return bairro;
    }

    public Cidade getCidade() {
        return cidade;
    }

    public Estado getEstado() {
        return estado;
    }

    public Pais getPais() {
        return pais;
    }

    public Geolocalizacao getGeolocalizacao() {
        return geolocalizacao;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Endereco endereco = (Endereco) o;
        return Objects.equals(cep, endereco.cep) &&
                Objects.equals(numero, endereco.numero) &&
                Objects.equals(logradouro, endereco.logradouro);
    }

    @Override
    public int hashCode() {
        return Objects.hash(cep, numero, logradouro);
    }

    @Override
    public String toString() {
        return "Endereco{" +
                "logradouro=" + logradouro +
                ", numero=" + numero +
                (complemento != null && complemento.isPresente() ? ", complemento=" + complemento : "") +
                ", bairro=" + bairro +
                ", cidade=" + cidade +
                ", estado=" + estado +
                ", cep=" + cep.getFormatado() +
                ", pais=" + pais +
                ", tipo=" + tipoEndereco +
                ", principal=" + enderecoPrincipal +
                (geolocalizacao.isPresente() ? ", geo=" + geolocalizacao : "") +
                '}';
    }
}
