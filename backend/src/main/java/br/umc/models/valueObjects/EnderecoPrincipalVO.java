package br.umc.models.valueObjects;

import br.umc.models.enums.EnderecoPrincipal;

import java.util.Objects;

public class EnderecoPrincipalVO {

    private final EnderecoPrincipal valor;

    public EnderecoPrincipalVO(EnderecoPrincipal valor) {
        validar(valor);
        this.valor = valor;
    }

    public EnderecoPrincipalVO(String valor) {
        this(parse(valor));
    }

    private static EnderecoPrincipal parse(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException("Endereço principal não pode ser vazio");
        }
        try {
            return EnderecoPrincipal.valueOf(valor.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Valor inválido para endereço principal: " + valor +
                    ". Valores aceitos: SIM, NAO");
        }
    }

    private void validar(EnderecoPrincipal valor) {
        if (valor == null) {
            throw new IllegalArgumentException("Endereço principal não pode ser nulo");
        }
    }

    public EnderecoPrincipal getValor() {
        return valor;
    }

    public boolean isPrincipal() {
        return EnderecoPrincipal.SIM == valor;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EnderecoPrincipalVO that = (EnderecoPrincipalVO) o;
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
