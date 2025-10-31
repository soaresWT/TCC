// Exemplo: Como migrar um componente para usar os novos serviços e tipos

// ANTES - Código antigo (app/exemplo/page.tsx)
/\*
"use client";

import { useState, useEffect } from "react";

interface User {
\_id: string;
name: string;
email: string;
// ... outros campos duplicados
}

export default function ExemploAntigo() {
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);

// Requisição manual duplicada
const fetchUsers = async () => {
setLoading(true);
try {
const response = await fetch("/api/users");
if (!response.ok) {
throw new Error("Erro ao carregar usuários");
}
const data = await response.json();
setUsers(data);
} catch (error) {
console.error(error);
} finally {
setLoading(false);
}
};

const createUser = async (userData) => {
try {
const response = await fetch("/api/users", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(userData),
});

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar usuário");
      }

      fetchUsers(); // Recarregar lista
    } catch (error) {
      console.error(error);
    }

};

useEffect(() => {
fetchUsers();
}, []);

return (
// JSX aqui...
);
}
\*/

// DEPOIS - Código refatorado
"use client";

import { useState, useEffect } from "react";
import { User, UserFormData } from "@/types/user";
import { UserService } from "@/services/user";
import { message } from "antd";

export default function ExemploRefatorado() {
const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState(false);

// Uso do serviço centralizado
const fetchUsers = async () => {
setLoading(true);
try {
const data = await UserService.getUsers();
setUsers(data);
} catch (error) {
message.error("Erro ao carregar usuários");
} finally {
setLoading(false);
}
};

const createUser = async (userData: UserFormData) => {
try {
await UserService.createUser(userData);
message.success("Usuário criado com sucesso!");
fetchUsers(); // Recarregar lista
} catch (error) {
message.error((error as Error).message);
}
};

useEffect(() => {
fetchUsers();
}, []);

return (
// JSX aqui...
);
}

// BENEFÍCIOS DA MIGRAÇÃO:

// 1. Tipos centralizados - não há duplicação de interfaces
// 2. Lógica de API centralizada - reutilizável em outros componentes
// 3. Tratamento de erro consistente
// 4. TypeScript mais forte - dados tipados corretamente
// 5. Manutenção simplificada - mudanças na API só afetam o serviço
// 6. Código mais limpo e focado na lógica do componente
