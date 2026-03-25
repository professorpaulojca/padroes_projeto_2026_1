package br.umc.services;

import br.umc.dto.endereco.EnderecoJpaRequestDTO;
import br.umc.dto.endereco.EnderecoJpaResponseDTO;
import br.umc.dto.pessoa.PessoaJpaResponseDTO;
import br.umc.dto.pessoa.PessoaRequestDTO;
import br.umc.models.EnderecoEntity;
import br.umc.models.PessoaEntity;
import br.umc.repositories.EnderecoRepository;
import br.umc.repositories.PessoaJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PessoaJpaService {

    private static final Logger log = LoggerFactory.getLogger(PessoaJpaService.class);
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
        log.info("[PESSOA] Cadastrando pessoa: nome={}", dto.getNome());
        LocalDate dataNascimento = parsarData(dto.getDataNascimento());

        PessoaEntity pessoa = new PessoaEntity();
        pessoa.setNome(dto.getNome().trim());
        pessoa.setDataNascimento(dataNascimento);
        pessoa.setSobrenome(dto.getSobrenome());
        pessoa.setCpf(dto.getCpf());
        pessoa.setRg(dto.getRg());
        pessoa.setSexo(dto.getSexo());
        pessoa.setEmail(dto.getEmail());
        pessoa.setTelefone(dto.getTelefone());
        pessoa.setCelular(dto.getCelular());
        pessoa.setObservacoes(dto.getObservacoes());
        pessoa.setTipoSanguineo(dto.getTipoSanguineo());
        pessoa.setEstadoCivil(dto.getEstadoCivil());
        pessoa.setNacionalidade(dto.getNacionalidade());
        pessoa.setNaturalidade(dto.getNaturalidade());
        pessoa.setProfissao(dto.getProfissao());
        pessoa.setEmpresa(dto.getEmpresa());

        pessoa = pessoaJpaRepository.save(pessoa);
        log.info("[PESSOA] Pessoa cadastrada com sucesso: id={} | nome={}", pessoa.getId(), pessoa.getNome());
        return PessoaJpaResponseDTO.fromEntity(pessoa);
    }

    @Transactional(readOnly = true)
    public List<PessoaJpaResponseDTO> listarTodas() {
        log.debug("[PESSOA] Listando todas as pessoas");
        List<PessoaJpaResponseDTO> resultado = pessoaJpaRepository.findAllOrderByNome()
                .stream()
                .map(PessoaJpaResponseDTO::fromEntity)
                .collect(Collectors.toList());
        log.debug("[PESSOA] Total de pessoas encontradas: {}", resultado.size());
        return resultado;
    }

    @Transactional(readOnly = true)
    public PessoaJpaResponseDTO buscarPorId(Long id) {
        log.debug("[PESSOA] Buscando pessoa por ID: {}", id);
        PessoaEntity pessoa = pessoaJpaRepository.findByIdAtivo(id)
                .orElseThrow(() -> {
                    log.warn("[PESSOA] Pessoa não encontrada: id={}", id);
                    return new IllegalArgumentException("Pessoa não encontrada com ID: " + id);
                });
        return PessoaJpaResponseDTO.fromEntity(pessoa);
    }

    @Transactional(readOnly = true)
    public List<PessoaJpaResponseDTO> buscarPorNome(String nome) {
        log.debug("[PESSOA] Buscando pessoas por nome: termo={}", nome);
        List<PessoaJpaResponseDTO> resultado = pessoaJpaRepository.findByNomeContainingIgnoreCase(nome)
                .stream()
                .map(PessoaJpaResponseDTO::fromEntity)
                .collect(Collectors.toList());
        log.debug("[PESSOA] Busca por nome concluída: termo={} | resultados={}", nome, resultado.size());
        return resultado;
    }

    @Transactional
    public PessoaJpaResponseDTO atualizar(Long id, PessoaRequestDTO dto) {
        log.info("[PESSOA] Atualizando pessoa: id={} | nome={}", id, dto.getNome());
        pessoaJpaRepository.findByIdAtivo(id)
                .orElseThrow(() -> {
                    log.warn("[PESSOA] Pessoa não encontrada para atualização: id={}", id);
                    return new IllegalArgumentException("Pessoa não encontrada com ID: " + id);
                });

        LocalDate dataNascimento = parsarData(dto.getDataNascimento());
        pessoaJpaRepository.updatePessoa(id, dto.getNome().trim(),
                dto.getSobrenome(), dto.getCpf(), dto.getRg(),
                dataNascimento, dto.getSexo(), dto.getEmail(),
                dto.getTelefone(), dto.getCelular(), dto.getObservacoes(),
                dto.getTipoSanguineo(), dto.getEstadoCivil(),
                dto.getNacionalidade(), dto.getNaturalidade(),
                dto.getProfissao(), dto.getEmpresa());

        log.info("[PESSOA] Pessoa atualizada com sucesso: id={}", id);
        return PessoaJpaResponseDTO.fromEntity(pessoaJpaRepository.findByIdAtivo(id).orElseThrow());
    }

    @Transactional
    public void excluir(Long id) {
        log.info("[PESSOA] Excluindo pessoa: id={}", id);
        pessoaJpaRepository.findByIdAtivo(id)
                .orElseThrow(() -> {
                    log.warn("[PESSOA] Pessoa não encontrada para exclusão: id={}", id);
                    return new IllegalArgumentException("Pessoa não encontrada com ID: " + id);
                });
        pessoaJpaRepository.softDelete(id);
        log.info("[PESSOA] Pessoa excluída (soft delete) com sucesso: id={}", id);
    }

    @Transactional
    public List<EnderecoJpaResponseDTO> adicionarEnderecos(Long pessoaId, List<EnderecoJpaRequestDTO> dtos) {
        log.info("[PESSOA] Adicionando {} endereço(s) à pessoa: pessoaId={}", dtos.size(), pessoaId);
        PessoaEntity pessoa = pessoaJpaRepository.findByIdAtivo(pessoaId)
                .orElseThrow(() -> new IllegalArgumentException("Pessoa não encontrada com ID: " + pessoaId));

        return dtos.stream().map(dto -> {
            EnderecoEntity endereco = enderecoJpaService.construirEPersistirEndereco(dto);
            pessoaJpaRepository.vincularEndereco(pessoa.getId(), endereco.getId());
            return EnderecoJpaResponseDTO.fromEntity(endereco);
        }).collect(Collectors.toList());
    }

    @Transactional
    public void desvincularEndereco(Long pessoaId, Long enderecoId) {
        log.info("[PESSOA] Desvinculando endereço: pessoaId={} | enderecoId={}", pessoaId, enderecoId);
        if (pessoaJpaRepository.findByIdAtivo(pessoaId).isEmpty()) {
            log.warn("[PESSOA] Pessoa não encontrada para desvincular: pessoaId={}", pessoaId);
            throw new IllegalArgumentException("Pessoa não encontrada com ID: " + pessoaId);
        }
        if (enderecoRepository.findByIdAtivo(enderecoId).isEmpty()) {
            log.warn("[PESSOA] Endereço não encontrado para desvincular: enderecoId={}", enderecoId);
            throw new IllegalArgumentException("Endereço não encontrado com ID: " + enderecoId);
        }
        pessoaJpaRepository.desvincularEndereco(pessoaId, enderecoId);
        log.info("[PESSOA] Endereço desvinculado com sucesso: pessoaId={} | enderecoId={}", pessoaId, enderecoId);
    }

    @Transactional(readOnly = true)
    public List<EnderecoJpaResponseDTO> listarEnderecos(Long pessoaId) {
        if (pessoaJpaRepository.findByIdAtivo(pessoaId).isEmpty()) {
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
