package br.umc.models.valueObjects;

import java.util.Objects;

public class Numero {

    private final String valor;

    public Numero(String valor) {
        validar(valor);
        this.valor = valor.trim();
    }

    private void validar(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException("Número não pode ser vazio");
        }

        if (valor.trim().length() > 10) {
            throw new IllegalArgumentException("Número deve ter no máximo 10 caracteres");
        }

        if (!valor.trim().matches("^[a-zA-Z0-9\\-/]+$")) {
            throw new IllegalArgumentException("Número deve conter apenas letras, dígitos, hífen ou barra");
        }
    }

    public String getValor() {
        return valor;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Numero numero = (Numero) o;
        return Objects.equals(valor, numero.valor);
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
