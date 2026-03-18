package br.umc.services;

import br.umc.dto.EnderecoDTO;
import br.umc.dto.EnderecoResponseDTO;
import br.umc.dto.PessoaDTO;
import br.umc.dto.PessoaResponseDTO;
import br.umc.models.Endereco;
import br.umc.models.Pessoa;
import br.umc.repositories.PessoaRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class PessoaService {

    private final PessoaRepository pessoaRepository;
    private final EnderecoService enderecoService;

    public PessoaService(PessoaRepository pessoaRepository, EnderecoService enderecoService) {
        this.pessoaRepository = pessoaRepository;
        this.enderecoService = enderecoService;
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

    public List<EnderecoResponseDTO> adicionarEnderecos(String nome, List<EnderecoDTO> enderecosDTO) {
        Pessoa pessoa = pessoaRepository.buscarPorNome(nome)
                .orElseThrow(() -> new IllegalArgumentException("Pessoa não encontrada com o nome: " + nome));

        List<Endereco> enderecosConstruidos = enderecosDTO.stream()
                .map(enderecoService::construirEndereco)
                .collect(Collectors.toList());

        enderecosConstruidos.forEach(pessoa::adicionarEndereco);

        pessoaRepository.salvar(pessoa);

        return enderecosConstruidos.stream()
                .map(EnderecoResponseDTO::fromEndereco)
                .collect(Collectors.toList());
    }
}
