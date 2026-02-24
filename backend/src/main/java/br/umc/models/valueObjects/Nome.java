package br.umc.models.valueObjects;

import java.util.Objects;

public class Nome {

    private final String valor;

    public Nome(String valor) {
        validar(valor);
        this.valor = valor.trim();
    }

    private void validar(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException("Nome não pode ser vazio");
        }

        if (valor.trim().length() < 2) {
            throw new IllegalArgumentException("Nome deve ter no mínimo 2 caracteres");
        }

        if (valor.trim().length() > 100) {
            throw new IllegalArgumentException("Nome deve ter no máximo 100 caracteres");
        }

        if (valor.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Nome não pode conter números");
        }

        if (!valor.matches("^[a-zA-ZÀ-ÿ\\s]+$")) {
            throw new IllegalArgumentException("Nome deve conter apenas letras e espaços");
        }
    }

    public String getValor() {
        return valor;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Nome nome = (Nome) o;
        return Objects.equals(valor, nome.valor);
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
