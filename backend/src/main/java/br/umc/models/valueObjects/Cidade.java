package br.umc.models.valueObjects;

import java.util.Objects;

public class Cidade {

    private final String valor;

    public Cidade(String valor) {
        validar(valor);
        this.valor = valor.trim();
    }

    private void validar(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException("Cidade não pode ser vazia");
        }

        if (valor.trim().length() < 2) {
            throw new IllegalArgumentException("Cidade deve ter no mínimo 2 caracteres");
        }

        if (valor.trim().length() > 100) {
            throw new IllegalArgumentException("Cidade deve ter no máximo 100 caracteres");
        }

        if (!valor.trim().matches("^[a-zA-ZÀ-ÿ\\s\\-']+$")) {
            throw new IllegalArgumentException("Cidade deve conter apenas letras, espaços, hífen ou apóstrofo");
        }
    }

    public String getValor() {
        return valor;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Cidade cidade = (Cidade) o;
        return Objects.equals(valor, cidade.valor);
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
