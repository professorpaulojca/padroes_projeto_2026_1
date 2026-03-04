package br.umc.models.valueObjects;

import java.util.Objects;

public class Pais {

    private final String valor;

    public Pais(String valor) {
        validar(valor);
        this.valor = valor.trim();
    }

    private void validar(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException("País não pode ser vazio");
        }

        if (valor.trim().length() < 2) {
            throw new IllegalArgumentException("País deve ter no mínimo 2 caracteres");
        }

        if (valor.trim().length() > 100) {
            throw new IllegalArgumentException("País deve ter no máximo 100 caracteres");
        }

        if (!valor.trim().matches("^[a-zA-ZÀ-ÿ\\s\\-']+$")) {
            throw new IllegalArgumentException("País deve conter apenas letras, espaços, hífen ou apóstrofo");
        }
    }

    public String getValor() {
        return valor;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Pais pais = (Pais) o;
        return Objects.equals(valor, pais.valor);
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
