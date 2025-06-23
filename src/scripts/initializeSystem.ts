import User from "../models/User";
import Bolsa from "../models/Bolsa";
import dbConnection from "../lib/mongodb";

export async function createDefaultAdmin() {
  await dbConnection();

  try {
    // Verificar se já existe um admin
    const existingAdmin = await User.findOne({ tipo: "admin" });
    if (existingAdmin) {
      console.log("Usuário admin já existe");
      return;
    }

    // Criar usuário admin padrão
    const adminUser = await User.create({
      email: "admin@sistema.com",
      password: "admin123", // Será hasheada automaticamente pelo middleware
      name: "Administrador do Sistema",
      tipo: "admin",
      campus: "Campus I - João Pessoa",
    });

    console.log("Usuário admin criado com sucesso:", adminUser.email);

    // Criar algumas bolsas de exemplo
    const bolsasExemplo = [
      { nome: "PIBIC - Iniciação Científica" },
      { nome: "PIBEX - Extensão" },
      { nome: "PIBID - Educação" },
      { nome: "PIVIC - Inovação Tecnológica" },
    ];

    for (const bolsaData of bolsasExemplo) {
      const existingBolsa = await Bolsa.findOne({ nome: bolsaData.nome });
      if (!existingBolsa) {
        await Bolsa.create(bolsaData);
        console.log("Bolsa criada:", bolsaData.nome);
      }
    }

    console.log("Sistema inicializado com sucesso!");
    console.log("Login admin: admin@sistema.com");
    console.log("Senha admin: admin123");
  } catch (error) {
    console.error("Erro ao criar dados iniciais:", error);
  }
}
