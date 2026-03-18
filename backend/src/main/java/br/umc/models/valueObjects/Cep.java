package br.umc.models.valueObjects;

import java.util.Objects;

public class Cep {

    private final String valor;

    public Cep(String valor) {
        validar(valor);
        this.valor = normalizar(valor);
    }

    private String normalizar(String valor) {
        return valor.trim().replaceAll("[^0-9]", "");
    }

    private void validar(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException("CEP não pode ser vazio");
        }

        String apenasDigitos = valor.trim().replaceAll("[^0-9]", "");

        if (apenasDigitos.length() != 8) {
            throw new IllegalArgumentException("CEP deve conter exatamente 8 dígitos");
        }

        if (apenasDigitos.matches("0{8}")) {
            throw new IllegalArgumentException("CEP inválido");
        }
    }

    public String getValor() {
        return valor;
    }

    public String getFormatado() {
        return valor.substring(0, 5) + "-" + valor.substring(5);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Cep cep = (Cep) o;
        return Objects.equals(valor, cep.valor);
    }

    @Override
    public int hashCode() {
        return Objects.hash(valor);
    }

    @Override
    public String toString() {
        return getFormatado();
    }
}
