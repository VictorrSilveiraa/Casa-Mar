export type ImageKey = keyof typeof images;

export const images = {
  heroDesktop: { source: "Imagem da HERO.png", slug: "hero-desktop", width: 1629, height: 965, alt: "Fachada da Casa Praiamar entre coqueiros, jardim e passarela de madeira", desktop: "50% 53%", mobile: "50% 57%" },
  heroMobile: { source: "HERO MOBILE.png", slug: "hero-mobile", width: 941, height: 1672, alt: "Passarela de madeira em direção à Casa Praiamar entre coqueiros", desktop: "50% 57%", mobile: "50% 57%" },
  kitchen: { source: "Imagem do ChatGPT 12 de out. de 2026, 13_47_25-1.png", slug: "cozinha-gourmet", width: 1448, height: 1086, alt: "Mesa de madeira e cadeiras diante da cozinha gourmet climatizada", desktop: "50% 48%", mobile: "50% 48%" },
  social: { source: "Imagem do ChatGPT 12 de out. de 2026, 13_47_31-2.png", slug: "ambiente-social", width: 1448, height: 1086, alt: "Ambiente social coberto com rede, sofá e mesa, aberto para o mar", desktop: "53% 50%", mobile: "59% 50%" },
  garden: { source: "Imagem do ChatGPT 12 de out. de 2026, 13_47_33-3.png", slug: "jardim", width: 1448, height: 1086, alt: "Espreguiçadeiras no jardim diante da fachada da Casa Praiamar", desktop: "51% 55%", mobile: "52% 54%" },
  poolNight: { source: "Imagem do ChatGPT 12 de out. de 2026, 13_47_46-2.png", slug: "piscina-noite", width: 1629, height: 965, alt: "Piscina iluminada à noite com a fachada e ambientes sociais ao redor", desktop: "50% 62%", mobile: "52% 61%" },
  poolSide: { source: "Imagem do ChatGPT 12 de out. de 2026, 13_47_44-1.png", slug: "piscina-lateral", width: 1629, height: 965, alt: "Piscina iluminada à noite vista ao lado das espreguiçadeiras", desktop: "55% 60%", mobile: "63% 57%" },
  poolDay: { source: "Imagem do ChatGPT 12 de out. de 2026, 13_47_58-1.png", slug: "piscina-dia", width: 1629, height: 965, alt: "Piscina durante o dia com vegetação e fachada da casa", desktop: "56% 51%", mobile: "65% 50%" },
  dusk: { source: "Imagem do ChatGPT 12 de out. de 2026, 13_48_02-3.png", slug: "patio-entardecer", width: 1629, height: 965, alt: "Pátio com piscina e fachada da casa sob céu de fim de tarde", desktop: "53% 50%", mobile: "58% 53%" },
  socialPortrait: { source: "SnapInsta.to_844417434_18629952292046998_5549541857437428914_n.jpg", slug: "rede-social", width: 1080, height: 1919, alt: "Rede vermelha em ambiente social coberto por madeira", desktop: "54% 52%", mobile: "51% 49%" },
  lawnPortrait: { source: "SnapInsta.to_845902731_18629952928046998_4620714375917682651_n.jpg", slug: "gramado-entardecer", width: 1080, height: 1919, alt: "Espreguiçadeiras no gramado ao lado da casa ao entardecer", desktop: "53% 56%", mobile: "52% 54%" },
} as const;

export const imageWidths = (width: number) => [...new Set([640, 960, 1440, 1920, width].filter((size) => size <= width))].sort((a, b) => a - b);
export const imageUrl = (key: ImageKey, width: number, format: "avif" | "webp") => `/media/${images[key].slug}-${width}.${format}`;
export const imageSrcSet = (key: ImageKey, format: "avif" | "webp") => imageWidths(images[key].width).map((width) => `${imageUrl(key, width, format)} ${width}w`).join(", ");
