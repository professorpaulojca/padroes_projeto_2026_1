package br.umc.services;

import br.umc.dto.endereco.EnderecoJpaRequestDTO;
import br.umc.dto.endereco.EnderecoJpaResponseDTO;
import br.umc.dto.pessoa.PessoaJpaResponseDTO;
import br.umc.dto.pessoa.PessoaRequestDTO;
import br.umc.models.EnderecoEntity;
import br.umc.models.PessoaEntity;
import br.umc.repositories.EnderecoRepository;
import br.umc.repositories.PessoaJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PessoaJpaService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final PessoaJpaRepository pessoaJpaRepository;
    private final EnderecoRepository enderecoRepository;
    private final EnderecoJpaService enderecoJpaService;

    public PessoaJpaService(PessoaJpaRepository pessoaJpaRepository,
                             EnderecoRepository enderecoRepository,
                             EnderecoJpaService enderecoJpaService) {
        this.pessoaJpaRepository = pessoaJpaRepository;
        this.enderecoRepository = enderecoRepository;
        this.enderecoJpaService = enderecoJpaService;
    }

    @Transactional
    public PessoaJpaResponseDTO cadastrar(PessoaRequestDTO dto) {
        LocalDate dataNascimento = parsarData(dto.getDataNascimento());

        PessoaEntity pessoa = new PessoaEntity();
        pessoa.setNome(dto.getNome().trim());
        pessoa.setDataNascimento(dataNascimento);

        pessoa = pessoaJpaRepository.save(pessoa);
        return PessoaJpaResponseDTO.fromEntity(pessoa);
    }

    @Transactional(readOnly = true)
    public List<PessoaJpaResponseDTO> listarTodas() {
        return pessoaJpaRepository.findAllOrderByNome()
                .stream()
                .map(PessoaJpaResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PessoaJpaResponseDTO buscarPorId(Long id) {
        PessoaEntity pessoa = pessoaJpaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pessoa não encontrada com ID: " + id));
        return PessoaJpaResponseDTO.fromEntity(pessoa);
    }

    @Transactional(readOnly = true)
    public List<PessoaJpaResponseDTO> buscarPorNome(String nome) {
        return pessoaJpaRepository.findByNomeContainingIgnoreCase(nome)
                .stream()
                .map(PessoaJpaResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PessoaJpaResponseDTO atualizar(Long id, PessoaRequestDTO dto) {
        PessoaEntity pessoa = pessoaJpaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pessoa não encontrada com ID: " + id));

        LocalDate dataNascimento = parsarData(dto.getDataNascimento());
        pessoaJpaRepository.updatePessoa(id, dto.getNome().trim(), dataNascimento);

        return PessoaJpaResponseDTO.fromEntity(pessoaJpaRepository.findById(id).orElseThrow());
    }

    @Transactional
    public void excluir(Long id) {
        if (!pessoaJpaRepository.existsById(id)) {
            throw new IllegalArgumentException("Pessoa não encontrada com ID: " + id);
        }
        pessoaJpaRepository.deleteById(id);
    }

    @Transactional
    public List<EnderecoJpaResponseDTO> adicionarEnderecos(Long pessoaId, List<EnderecoJpaRequestDTO> dtos) {
        PessoaEntity pessoa = pessoaJpaRepository.findById(pessoaId)
                .orElseThrow(() -> new IllegalArgumentException("Pessoa não encontrada com ID: " + pessoaId));

        return dtos.stream().map(dto -> {
            EnderecoEntity endereco = enderecoJpaService.construirEPersistirEndereco(dto);
            pessoaJpaRepository.vincularEndereco(pessoa.getId(), endereco.getId());
            return EnderecoJpaResponseDTO.fromEntity(endereco);
        }).collect(Collectors.toList());
    }

    @Transactional
    public void desvincularEndereco(Long pessoaId, Long enderecoId) {
        if (!pessoaJpaRepository.existsById(pessoaId)) {
            throw new IllegalArgumentException("Pessoa não encontrada com ID: " + pessoaId);
        }
        if (!enderecoRepository.existsById(enderecoId)) {
            throw new IllegalArgumentException("Endereço não encontrado com ID: " + enderecoId);
        }
        pessoaJpaRepository.desvincularEndereco(pessoaId, enderecoId);
    }

    @Transactional(readOnly = true)
    public List<EnderecoJpaResponseDTO> listarEnderecos(Long pessoaId) {
        if (!pessoaJpaRepository.existsById(pessoaId)) {
            throw new IllegalArgumentException("Pessoa não encontrada com ID: " + pessoaId);
        }
        return enderecoRepository.findByPessoaId(pessoaId)
                .stream()
                .map(EnderecoJpaResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    private LocalDate parsarData(String dataStr) {
        try {
            return LocalDate.parse(dataStr.trim(), FORMATTER);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Data de nascimento inválida: " + dataStr + ". Use o formato dd/MM/yyyy");
        }
    }
}
