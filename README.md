# Brechó Luz do Luar

Loja-vitrine em React + TypeScript para apresentar produtos e encaminhar o cliente ao WhatsApp da loja.

## Recursos incluídos

- Página inicial com logo, menu, categorias e banners rotativos.
- Vitrine de produtos com filtros por categoria.
- Página individual do produto.
- Botão "Comprar pelo WhatsApp" com mensagem preenchida automaticamente.
- Área `/admin` com login Firebase Authentication.
- Formulário de cadastro com upload de imagem.
- Produtos no Cloud Firestore.
- Imagens no Firebase Storage.
- Layout responsivo.
- Dados de demonstração enquanto o Firebase ainda não está configurado.

## 1. Instalar

```bash
npm install
```

## 2. Configurar ambiente

Copie:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Preencha as variáveis do Firebase no `.env`.

## 3. Firebase

No Firebase Console:

1. Crie um projeto.
2. Ative Authentication > Sign-in method > Email/Password.
3. Crie manualmente o usuário administrador.
4. Crie o Firestore Database.
5. Ative o Firebase Storage.
6. Em Project settings > Your apps, adicione uma Web App e copie as credenciais para `.env`.

### Coleção

A coleção usada é:

```text
products
```

Cada documento possui, em geral:

```text
name
description
category
price
size
measurements
condition
imageUrl
featured
sold
createdAt
```

## 4. Regras iniciais do Firestore

Para um MVP, você pode permitir leitura pública e escrita apenas para usuário autenticado:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Em produção, o ideal é adicionar uma claim `admin: true` e validar essa claim nas regras.

## 5. Regras iniciais do Storage

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 6. WhatsApp

No `.env`:

```text
VITE_WHATSAPP_NUMBER=5521982202283
```

Use apenas números: código do país + DDD + telefone.

## 7. Executar

```bash
npm run dev
```

Acesse a URL mostrada pelo Vite.

## Observação importante para hospedagem

Se hospedar como SPA em Firebase Hosting, Vercel ou Netlify, configure rewrite/fallback para `index.html` para que rotas como `/produto/abc` e `/admin` funcionem ao atualizar a página.
