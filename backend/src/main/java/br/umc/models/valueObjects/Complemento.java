package br.umc.models.valueObjects;

import java.util.Objects;

public class Complemento {

    private final String valor;

    public Complemento(String valor) {
        validar(valor);
        this.valor = valor == null ? null : valor.trim();
    }

    private void validar(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            return;
        }

        if (valor.trim().length() > 100) {
            throw new IllegalArgumentException("Complemento deve ter no máximo 100 caracteres");
        }
    }

    public String getValor() {
        return valor;
    }

    public boolean isPresente() {
        return valor != null && !valor.isEmpty();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Complemento that = (Complemento) o;
        return Objects.equals(valor, that.valor);
    }

    @Override
    public int hashCode() {
        return Objects.hash(valor);
    }

    @Override
    public String toString() {
        return valor == null ? "" : valor;
    }
}
