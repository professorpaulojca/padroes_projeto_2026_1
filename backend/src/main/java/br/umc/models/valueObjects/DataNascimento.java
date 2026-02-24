package br.umc.models.valueObjects;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Objects;

public class DataNascimento {

    private final LocalDate valor;
    private static final int IDADE_MINIMA = 0;
    private static final int IDADE_MAXIMA = 150;

    public DataNascimento(LocalDate valor) {
        validar(valor);
        this.valor = valor;
    }

    public DataNascimento(String dataString) {
        LocalDate data = parseData(dataString);
        validar(data);
        this.valor = data;
    }

    private LocalDate parseData(String dataString) {
        if (dataString == null || dataString.trim().isEmpty()) {
            throw new IllegalArgumentException("Data de nascimento não pode ser vazia");
        }

        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            return LocalDate.parse(dataString.trim(), formatter);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Data de nascimento inválida. Use o formato dd/MM/yyyy");
        }
    }

    private void validar(LocalDate data) {
        if (data == null) {
            throw new IllegalArgumentException("Data de nascimento não pode ser nula");
        }

        if (data.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Data de nascimento não pode ser futura");
        }

        int idade = calcularIdade(data);

        if (idade < IDADE_MINIMA) {
            throw new IllegalArgumentException("Idade não pode ser negativa");
        }

        if (idade > IDADE_MAXIMA) {
            throw new IllegalArgumentException("Idade não pode ser superior a " + IDADE_MAXIMA + " anos");
        }
    }

    private int calcularIdade(LocalDate dataNascimento) {
        return Period.between(dataNascimento, LocalDate.now()).getYears();
    }

    public LocalDate getValor() {
        return valor;
    }

    public int getIdade() {
        return calcularIdade(valor);
    }

    public String getFormatado() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return valor.format(formatter);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DataNascimento that = (DataNascimento) o;
        return Objects.equals(valor, that.valor);
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
