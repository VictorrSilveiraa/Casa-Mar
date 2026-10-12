# Casa Praiamar

Homepage em Next.js App Router, TypeScript e CSS Modules. O conteúdo oficial está em `CONTEUDO.md`; as decisões fotográficas estão em `docs/image-map.md`.

## Executar

Requer Node.js 24 para os scripts locais que importam dados TypeScript diretamente.

```bash
npm install
npm run dev
```

As imagens otimizadas já estão em `public/media`. Para recriá-las sem modificar os originais:

```bash
npm run images:optimize
```

## Configuração

Edite somente `lib/site.config.ts` para informar número de WhatsApp (sem pontuação, com código do país), Instagram, domínio e link de localização. Enquanto o WhatsApp estiver vazio, a consulta apresenta uma mensagem pronta para copiar. O domínio é necessário para o canonical e sitemap de produção.

Os textos ficam em `lib/content.ts` e o mapeamento completo das fotos em `lib/images.ts`. A homepage não confirma reservas nem disponibilidade.

## Verificação

```bash
npm run lint
npm run typecheck
npm test
npm run contrast
npm run build
npm run validate:browser
```

`validate:browser` requer o Chromium do Playwright instalado (`npx playwright install chromium`) e o site iniciado em `http://127.0.0.1:3000` com `npm run start -- --hostname 127.0.0.1`. Os resultados do último passe estão em `docs/validation.md`.
