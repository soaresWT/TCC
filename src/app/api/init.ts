import dbConnection from "@/lib/mongodb";

// Função para inicializar a conexão
export async function initDatabase() {
  try {
    await dbConnection();
    console.log("Conexão com o banco de dados inicializada com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar conexão com o banco de dados:", error);
    throw error;
  }
}

// Inicializa a conexão
initDatabase();
