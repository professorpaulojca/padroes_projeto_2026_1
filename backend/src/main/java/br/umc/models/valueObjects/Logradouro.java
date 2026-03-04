package br.umc.models.valueObjects;

import java.util.Objects;

public class Logradouro {

    private final String valor;

    public Logradouro(String valor) {
        validar(valor);
        this.valor = valor.trim();
    }

    private void validar(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException("Logradouro não pode ser vazio");
        }

        if (valor.trim().length() < 3) {
            throw new IllegalArgumentException("Logradouro deve ter no mínimo 3 caracteres");
        }

        if (valor.trim().length() > 150) {
            throw new IllegalArgumentException("Logradouro deve ter no máximo 150 caracteres");
        }
    }

    public String getValor() {
        return valor;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Logradouro that = (Logradouro) o;
        return Objects.equals(valor, that.valor);
    }

    @Override
    public int hashCode() {
        return Objects.hash(valor);
    }

    @Override
    public String toString() {
        return valor;
    }
}
