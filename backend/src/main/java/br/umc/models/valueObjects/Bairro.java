package br.umc.models.valueObjects;

import java.util.Objects;

public class Bairro {

    private final String valor;

    public Bairro(String valor) {
        validar(valor);
        this.valor = valor.trim();
    }

    private void validar(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException("Bairro não pode ser vazio");
        }

        if (valor.trim().length() < 2) {
            throw new IllegalArgumentException("Bairro deve ter no mínimo 2 caracteres");
        }

        if (valor.trim().length() > 100) {
            throw new IllegalArgumentException("Bairro deve ter no máximo 100 caracteres");
        }
    }

    public String getValor() {
        return valor;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Bairro bairro = (Bairro) o;
        return Objects.equals(valor, bairro.valor);
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
