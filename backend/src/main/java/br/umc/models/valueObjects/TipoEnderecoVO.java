package br.umc.models.valueObjects;

import br.umc.models.enums.TipoEndereco;

import java.util.Objects;

public class TipoEnderecoVO {

    private final TipoEndereco valor;

    public TipoEnderecoVO(TipoEndereco valor) {
        validar(valor);
        this.valor = valor;
    }

    public TipoEnderecoVO(String valor) {
        this(parse(valor));
    }

    private static TipoEndereco parse(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException("Tipo de endereço não pode ser vazio");
        }
        try {
            return TipoEndereco.valueOf(valor.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Tipo de endereço inválido: " + valor +
                    ". Valores aceitos: RESIDENCIAL, COMERCIAL, COBRANCA, ENTREGA, OUTRO");
        }
    }

    private void validar(TipoEndereco valor) {
        if (valor == null) {
            throw new IllegalArgumentException("Tipo de endereço não pode ser nulo");
        }
    }

    public TipoEndereco getValor() {
        return valor;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TipoEnderecoVO that = (TipoEnderecoVO) o;
        return valor == that.valor;
    }

    @Override
    public int hashCode() {
        return Objects.hash(valor);
    }

    @Override
    public String toString() {
        return valor.name();
    }
}
