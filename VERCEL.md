# Como Implantar na Vercel (Deploying to Vercel)

Este aplicativo full-stack (Vite/React + Express + Gemini AI) está totalmente configurado para ser implantado na **Vercel** com suporte a rotas estáticas para o frontend e serverless functions para a API.

---

## 🚀 Passo a Passo para Implantar

1. **Importar o Repositório:**
   - Faça login na [Vercel](https://vercel.com).
   - Clique em **"Add New"** e depois em **"Project"**.
   - Conecte ao seu provedor de Git (GitHub, GitLab, etc.) e selecione este repositório.

2. **Configuração do Projeto (Project Settings):**
   - **Framework Preset:** Selecione **Vite** ou escolha **Other**.
   - **Build and Output Settings:**
     - **Build Command:** `npm run build` (ou `vite build`)
     - **Output Directory:** `dist`
     - **Install Command:** `npm install`
   
3. **Configuração de Variáveis de Ambiente:**
   - No painel da Vercel, em **Environment Variables**, adicione as seguintes variáveis:
     
     | Nome da Variável | Valor Recomendado | Descrição |
     | :--- | :--- | :--- |
     | `GEMINI_API_KEY` | *Sua chave de API do Gemini* | **Obrigatória** para a busca inteligente por Inteligência Artificial. Obtida em [Google AI Studio](https://aistudio.google.com/). |
     | `NODE_ENV` | `production` | Indica o modo de execução otimizado para produção. |

4. **Implantar:**
   - Clique no botão **"Deploy"**. A Vercel começará a compilar e implantará seu aplicativo em poucos segundos.

---

## 📂 Arquivos de Configuração Adicionados

- `vercel.json`: Define as regras do roteador da Vercel para direcionar as chamadas para a API `/api/*` para a Serverless Function e o restante para o frontend SPA.
- `api/index.ts`: Serve como o ponto de entrada das rotas Express na infraestrutura serverless da Vercel.

---

## 💾 Persistência de Dados no Vercel (database.json)

Como a infraestrutura Serverless da Vercel é **efêmera e de leitura-apenas** (read-only):
1. O banco de dados inicializado em `database.json` é carregado perfeitamente na primeira inicialização da função.
2. Atualizações e novos cadastros efetuados no painel utilizam a pasta `/tmp` do Vercel para simular a escrita correta do banco.
3. *Nota:* Por ser um ambiente serverless, alterações salvas nessa pasta `/tmp` serão redefinidas quando a instância da função for reciclada pela Vercel. Para uma solução de persistência de dados de longo prazo em produção, você pode facilmente acoplar um banco de dados estruturado como o **Firebase Firestore** nas suas rotas do `server.ts`.
