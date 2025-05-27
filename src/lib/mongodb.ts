import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tcc";
console.log("URL do MongoDB:", MONGODB_URI);
if (!MONGODB_URI) {
  throw new Error("Por favor, defina a variável de ambiente MONGODB_URI");
}

// Configurações globais do Mongoose
mongoose.set("strictQuery", false);

const dbConnection = async () => {
  const maxAttempts = 5;
  const retryInterval = 3000;
  let attempts = 1;

  while (attempts <= maxAttempts) {
    try {
      console.log("Tentando conectar ao banco...");

      const connection = await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 15000, // Aumentado para 15 segundos
        socketTimeoutMS: 45000, // Timeout para operações
        connectTimeoutMS: 15000, // Timeout para conexão inicial
        maxPoolSize: 10, // Número máximo de conexões no pool
        minPoolSize: 5, // Número mínimo de conexões no pool
      });

      console.log("🌏 Database connected: ", connection.connection.name);
      return connection;
    } catch (error) {
      console.error(
        "Erro ao conectar ao banco de dados:",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
      attempts++;

      if (attempts <= maxAttempts) {
        console.log(
          `Tentando novamente em ${retryInterval / 1000} segundos...`
        );
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      } else {
        console.error(
          "Número máximo de tentativas atingido. Falha ao conectar ao banco de dados."
        );
        throw error;
      }
    }
  }
};

export default dbConnection;
