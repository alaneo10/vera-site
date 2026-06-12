# Como publicar o site de VERA (GitHub Pages)

## 1. Criar o repositório
1. Crie uma conta em https://github.com (se ainda não tiver).
2. Crie um repositório novo chamado, por exemplo, `vera-site` (público).
3. Envie **o conteúdo desta pasta `site/`** para o repositório (pode arrastar os arquivos pela interface web do GitHub: *Add file → Upload files*). A estrutura deve ficar com `index.html` na raiz do repositório.

## 2. Ativar o GitHub Pages
1. No repositório: **Settings → Pages**.
2. Em *Source*, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`. Salve.
3. Em 1–2 minutos o site estará em `https://SEU_USUARIO.github.io/vera-site/`.

## 3. Domínio próprio (vera.org.br — verificado disponível em 12/06/2026)
1. Registre em https://registro.br (~R$40/ano).
2. No registro.br, em *DNS → Editar zona*, crie:
   - `A` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` para `www` → `SEU_USUARIO.github.io.`
3. No GitHub: **Settings → Pages → Custom domain** → digite `vera.org.br` e marque *Enforce HTTPS* (isso cria o arquivo `CNAME` automaticamente).

## 4. Formulário de e-mail (obrigatório antes de divulgar)
O formulário usa o Formspree (gratuito até 50 envios/mês):
1. Crie conta em https://formspree.io e um formulário novo.
2. Copie o ID (algo como `xqkrwdpz`).
3. No `index.html`, substitua `SEU_ID_FORMSPREE` na linha do `<form action=...>`.

## 5. Atualizar o livro
O PDF servido é `assets/VERA_livro_base.pdf`. Para atualizar, basta substituir o arquivo e reenviar.

## Estrutura
```
index.html        Página inicial (hero + manifesto + guias + livro + cadastro)
principios.html   Os 7 princípios expandidos
guias.html        Os 4 Guias em detalhe + o que um Guia nunca faz
livro.html        Página do livro + download
deverdade.html    Transparência (IA), FAQ e privacidade
assets/css/vera.css   Estilo compartilhado
assets/js/vera.js     Céu estrelado, menu e modal de escolha do Guia
assets/img/*.svg      Símbolo e os 4 Guias (animados)
assets/VERA_livro_base.pdf
```
O modal "Encontrar meu Guia" funciona em todas as páginas (botão dourado do menu).
