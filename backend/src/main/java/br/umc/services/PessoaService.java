package br.umc.services;

import br.umc.dto.PessoaDTO;
import br.umc.dto.PessoaResponseDTO;
import br.umc.models.valueObjects.Pessoa;
import br.umc.repositories.PessoaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PessoaService {

    private final PessoaRepository pessoaRepository;

    public PessoaService(PessoaRepository pessoaRepository) {
        this.pessoaRepository = pessoaRepository;
    }

    public PessoaResponseDTO cadastrarPessoa(PessoaDTO dto) {
        try {
            Pessoa pessoa = new Pessoa(dto.getNome(), dto.getDataNascimento());
            
            pessoaRepository.salvar(pessoa);
            
            return PessoaResponseDTO.fromPessoa(pessoa);
            
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Erro ao cadastrar pessoa: " + e.getMessage(), e);
        }
    }

    public List<PessoaResponseDTO> listarTodas() {
        List<Pessoa> pessoas = pessoaRepository.buscarTodas();
        return pessoas.stream()
                .map(PessoaResponseDTO::fromPessoa)
                .collect(Collectors.toList());
    }

    public Optional<PessoaResponseDTO> buscarPorNome(String nome) {
        Optional<Pessoa> pessoa = pessoaRepository.buscarPorNome(nome);
        return pessoa.map(PessoaResponseDTO::fromPessoa);
    }
}
