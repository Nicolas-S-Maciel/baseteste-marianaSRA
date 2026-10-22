package com.senai.mariana.controllers;

import com.senai.mariana.model.Registro;
import com.senai.mariana.repository.RegistroRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/frequencia")
@CrossOrigin(origins = "*")
public class PresencaController {

    private final RegistroRepository registroRepository;

    public PresencaController(RegistroRepository registroRepository) {
        this.registroRepository = registroRepository;
    }

    @GetMapping(value = {"", "/registrar"})
    public ResponseEntity<List<Registro>> listarRegistros() {
        return ResponseEntity.ok(registroRepository.findAllByOrderByDataDescHorarioDesc());
    }

    @PostMapping("/registrar")
    public ResponseEntity<Map<String, Object>> registrarFrequencia(@RequestBody Map<String, String> dados) {
        Map<String, Object> resposta = new HashMap<>();

        try {
            String nome = dados.getOrDefault("nome", "").trim();
            String cpf = dados.getOrDefault("cpf", "").trim();
            String tipo = dados.getOrDefault("tipo", "Atraso").trim();
            String data = dados.getOrDefault("data", "").trim();
            String horario = dados.getOrDefault("horario", "").trim();
            String ra = dados.get("ra");

            // Validação básica
            if (nome.isEmpty() && ra != null) {
                nome = "Aluno RA " + ra;
            }

            if (nome.isEmpty()) {
                resposta.put("status", "erro");
                resposta.put("mensagemVoz", "Nome do aluno não informado.");
                return ResponseEntity.badRequest().body(resposta);
            }

            Registro registro = new Registro(nome, cpf, tipo, data, horario);
            registroRepository.save(registro);

            resposta.put("status", "sucesso");
            String mensagemVoz = tipo + " registrado com sucesso para " + nome + ".";
            resposta.put("mensagemVoz", mensagemVoz);
            resposta.put("registro", registro);

            return ResponseEntity.ok(resposta);
        } catch (Exception e) {
            resposta.put("status", "erro");
            resposta.put("mensagemVoz", "Ocorreu um erro ao salvar o registro no banco de dados.");
            return ResponseEntity.internalServerError().body(resposta);
        }
    }
}
