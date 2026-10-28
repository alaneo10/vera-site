# Como publicar o site de VERA

O site está no repositório `alaneo10/vera-site` (GitHub Pages, domínio `somosvera.com.br`).
Esta pasta (`vera-site`) é o clone local, ligada ao GitHub Desktop.

## Publicar uma alteração (GitHub Desktop)
1. Abra o **GitHub Desktop**. O repositório atual deve ser `vera-site`.
2. Na aba **Changes**, confira a lista de arquivos alterados.
3. Embaixo, à esquerda, escreva um resumo (ex.: "Novo site: o céu") e clique em **Commit to main**.
4. Clique em **Push origin** (barra superior).
5. Em 1 a 2 minutos o site atualiza em https://somosvera.com.br. Se não aparecer, recarregue com Ctrl+F5.

## Onde mexer
- **Textos das páginas**: não edite os `.html` à mão. Edite
  `05_Site_planejamento/gerador_site.py` (fora deste repositório) e rode
  `python3 gerador_site.py <caminho-desta-pasta>`. Ele regenera as 10 páginas (PT na raiz, EN em `/en/`).
- **Visual**: `assets/css/vera.css`.
- **Interações**: `assets/js/` — `ceu.js` (céu real no topo), `constelacao.js` (Desenhe sua Constelação),
  `zoom.js` (zoom cósmico), `noites.js` (7 noites → agenda), `vera.js` (menu e escolha do Guia),
  `vera_chat.js` (conversa com os Guias). `ceu_dados.js` é o catálogo de estrelas (não editar).
- **Livros**: `assets/VERA_livro_base.pdf` (PT) e `assets/VERA_book_en.pdf` (EN). Basta substituir o arquivo.
- **Guias (IA)**: `guias/worker.js` roda na Cloudflare (vera-guias.alaneo10.workers.dev). Alterá-lo aqui
  não muda nada no ar: é preciso colar o código no painel da Cloudflare e clicar em Deploy.

## Serviços externos
- E-mail: Formspree, formulário `mojzpedy`.
- Guias: Cloudflare Worker → Google Gemini (chave guardada como segredo na Cloudflare).
- Domínio: registro.br, DNS apontando para o GitHub Pages.
