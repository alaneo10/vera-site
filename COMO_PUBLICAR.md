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

## Google (busca)
O gerador também cria `sitemap.xml`, `robots.txt` e `404.html`, e coloca em cada página título,
descrição, versões PT/EN (hreflang) e dados estruturados (organização, livro, perguntas frequentes).
Cadastro único no Google Search Console:
1. Acesse https://search.google.com/search-console → **Adicionar propriedade** → tipo **Domínio** → `somosvera.com.br`.
2. O Google mostra um registro **TXT**. No registro.br: domínio → **DNS → Editar zona** → novo registro TXT
   (nome em branco, valor = o texto copiado) → salvar. Volte ao Search Console e clique **Verificar**
   (pode levar de minutos a algumas horas).
3. Menu **Sitemaps** → digite `sitemap.xml` → **Enviar**.
4. Menu **Inspeção de URL** → `https://somosvera.com.br/` → **Solicitar indexação**. Repita com `https://somosvera.com.br/en/`.
5. Opcional: https://www.bing.com/webmasters → **Importar do Google Search Console** (cobre Bing e DuckDuckGo).

## Serviços externos
- E-mail: Formspree, formulário `mojzpedy`.
- Guias: Cloudflare Worker → Google Gemini (chave guardada como segredo na Cloudflare).
- Domínio: registro.br, DNS apontando para o GitHub Pages.
