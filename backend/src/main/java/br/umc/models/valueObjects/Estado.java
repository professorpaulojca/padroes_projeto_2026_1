package br.umc.models.valueObjects;

import java.util.Objects;
import java.util.Set;

public class Estado {

    private static final Set<String> SIGLAS_VALIDAS = Set.of(
            "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
            "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
            "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
    );

    private final String valor;

    public Estado(String valor) {
        validar(valor);
        this.valor = valor.trim().toUpperCase();
    }

    private void validar(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException("Estado não pode ser vazio");
        }

        if (valor.trim().length() > 100) {
            throw new IllegalArgumentException("Estado deve ter no máximo 100 caracteres");
        }

        String normalizado = valor.trim().toUpperCase();
        if (normalizado.length() == 2 && !SIGLAS_VALIDAS.contains(normalizado)) {
            throw new IllegalArgumentException("Sigla de estado inválida: " + normalizado);
        }
    }

    public String getValor() {
        return valor;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Estado estado = (Estado) o;
        return Objects.equals(valor, estado.valor);
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
