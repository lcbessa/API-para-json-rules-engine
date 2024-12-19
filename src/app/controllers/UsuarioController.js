import { verificarCampoObrigatorio } from "../../utils/validacoes";
import UsuarioPersistence from "../persistence/UsuarioPersistence";
import { gerarToken } from "../../utils/validacoes";
import axios from "axios";

export default {
  async criarUsuario(request, response) {
    try {
      const { nome, email, senha } = request.body;

      let resposta = null;

      resposta = verificarCampoObrigatorio(nome, "nome");
      // Verificar se o campo "nome" não é nulo
      if (resposta) return response.status(resposta.status).json(resposta);

      // Verificar se o campo "email" não é nulo
      resposta = verificarCampoObrigatorio(email, "email");
      if (resposta) return response.status(resposta.status).json(resposta);

      // Verificar se o campo "senha" não é nulo
      resposta = verificarCampoObrigatorio(senha, "senha");
      if (resposta) return response.status(resposta.status).json(resposta);

      const motorRegrasResponse = await axios.post(
        "http://localhost:7000/motor-de-regras/cadastrarUsuario",
        { email, senha },
        { validateStatus: () => true }
      );
      if (motorRegrasResponse.data.success === true) {
        // Regras de negócio foram atendidas, criar o usuário
        const novoUsuario = await UsuarioPersistence.criarUsuario({
          nome,
          email,
          senha,
        });
        return response.status(201).json(novoUsuario);
      } else {
        // Regras de negócio não foram atendidas, retorna o motivo do erro
        console.log("Erro ao criar usuário", motorRegrasResponse.data);

        return response.status(400).json(motorRegrasResponse.data);
      }
    } catch (error) {
      console.error("Erro ao criar usuário", error);
      return response
        .status(500)
        .send({ error: "Não foi possível criar um usuário!" });
    }
  },
  async Login(request, response) {
    try {
      const { email, senha } = request.body;

      let resposta = null;
      // Verificar se o campo "email" não é nulo
      resposta = verificarCampoObrigatorio(email, "email");
      if (resposta) return response.status(resposta.status).json(resposta);
      // Verificar se o campo "senha" não é nulo
      resposta = verificarCampoObrigatorio(senha, "senha");
      if (resposta) return response.status(resposta.status).json(resposta);

      const motorRegrasResponse = await axios.post(
        "http://localhost:7000/motor-de-regras/loginUsuario",
        { email, senha },
        { validateStatus: () => true }
      );
      if (motorRegrasResponse.data.success === true) {
        // Regras de negócio foram atendidas, autenticar o usuário
        let usuarioBuscado = await UsuarioPersistence.buscarUsuarioPorEmail(
          email
        );
        const token = gerarToken(
          usuarioBuscado.success.id,
          usuarioBuscado.success.admin
        );
        return response.status(200).json({
          success: { message: "Autenticado com sucesso!", token },
        });
      } else {
        // Regras de negócio não foram atendidas, retorna o motivo do erro
        console.log("Erro ao autenticar usuário", motorRegrasResponse.data);
        return response.status(400).json(motorRegrasResponse.data);
      }
    } catch (error) {
      console.error("Erro ao autenticar usuário", error);
      return response
        .status(500)
        .send({ error: "Não foi possível autenticar o usuário!" });
    }
  },
  async ListarUsuarios(request, response) {
    try {
      const resposta = await UsuarioBusiness.listarUsuarios();
      return response.status(resposta.status).json(resposta);
    } catch (error) {
      console.error("Erro ao listar usuários", error);
      return response
        .status(500)
        .send({ error: "Não foi possível listar os usuários!" });
    }
  },
};
