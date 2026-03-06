# TechLab — Loja de Notebooks

Site vitrine com painel admin protegido por login real (JWT + backend Node.js).

---

## 📁 Estrutura do projeto

```
notebook-store/
├── frontend/              ← site que o cliente vê
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── auth.js        ← gerencia login e token
│       └── app.js         ← lógica da vitrine
│
└── backend/               ← servidor Node.js + TypeScript
    ├── src/
    │   ├── server.ts
    │   ├── routes/
    │   │   ├── auth.ts        ← POST /auth/login
    │   │   └── products.ts    ← GET/POST/DELETE /products
    │   ├── middleware/
    │   │   └── authGuard.ts   ← proteção JWT
    │   └── database/
    │       └── db.ts          ← SQLite
    ├── .env                ← ⚠️ suas credenciais (nunca no GitHub)
    ├── .env.example        ← modelo do .env
    ├── package.json
    └── tsconfig.json
```

---

## 🚀 Passo a passo — do zero ao funcionando

### Pré-requisito
Instale o **Node.js LTS** em https://nodejs.org (botão verde "LTS").
Após instalar, feche e reabra o VS Code.

---

### Passo 1 — Abrir o projeto no VS Code

1. Extraia o ZIP em qualquer pasta (ex: `Documentos/notebook-store`)
2. Abra o VS Code
3. **File → Open Folder** → selecione a pasta `notebook-store`

---

### Passo 2 — Configurar suas credenciais

1. No VS Code, abra o arquivo **`backend/.env`**
2. Troque os valores:

```env
ADMIN_EMAIL=seu-email@exemplo.com
ADMIN_PASSWORD=suasenhaforte
JWT_SECRET=qualquer-frase-longa-e-aleatoria-aqui-123
```

3. Salve o arquivo (`Ctrl + S`)

> ⚠️ Nunca compartilhe o arquivo `.env` — ele não vai para o GitHub.

---

### Passo 3 — Instalar dependências

1. Abra o terminal no VS Code: **Terminal → New Terminal** (ou `Ctrl + '`)
2. Entre na pasta do backend:

```bash
cd backend
```

3. Instale as dependências (funciona em qualquer Windows, sem compilar nada):

```bash
npm install
```

---

### Passo 4 — Criar o banco de dados

Ainda no terminal dentro de `backend/`, rode os dois comandos:

```bash
npx prisma migrate dev --name init
```

```bash
npx prisma db seed
```

Você verá: `✅ Admin criado: seu-email@exemplo.com`

> Esses comandos criam o arquivo `store.db` com as tabelas e o usuário admin.

---

### Passo 5 — Ligar o servidor

```bash
npm run dev
```

Você verá:

```
🚀 Servidor rodando em http://localhost:3000
```

> Deixe este terminal aberto.

---

### Passo 6 — Abrir o frontend

1. Instale a extensão **Live Server** no VS Code (`Ctrl+Shift+X` → buscar "Live Server" de Ritwick Dey)
2. Abra **`frontend/index.html`**
3. Botão direito → **Open with Live Server**

Site em: `http://127.0.0.1:5500/frontend/`

---

### Passo 7 — Testar o login

1. Clique em **⚙ Painel Admin**
2. Digite o e-mail e senha do `.env`
3. Clique **Entrar** — o painel abre só para você!

---

## 🌐 Publicar na web (GitHub Pages + Railway)

### Frontend → GitHub Pages (grátis)

```bash
git init
git add .
git commit -m "feat: loja de notebooks"
git remote add origin https://github.com/seu-usuario/notebook-store.git
git push -u origin main
```

No GitHub: **Settings → Pages → Deploy from branch → main → /frontend → Save**

Site em: `https://seu-usuario.github.io/notebook-store/frontend/`

### Backend → Railway (grátis para começar)

1. Acesse https://railway.app e crie uma conta
2. **New Project → Deploy from GitHub repo**
3. Selecione seu repositório
4. Configure: **Root Directory = backend**, **Start Command = npm start**
5. Adicione as variáveis de ambiente (as do seu `.env`) em **Variables**
6. Copie a URL gerada pelo Railway
7. No `frontend/js/auth.js`, troque:
   ```js
   const API_URL = 'https://sua-url.railway.app';
   ```

---

## 🔧 Comandos úteis

```bash
# Iniciar backend (desenvolvimento)
cd backend && npm run dev

# Compilar para produção
cd backend && npm run build && npm start
```
