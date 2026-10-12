import Link from "next/link";

export default function NotFound() {
  return <main className="not-found"><p>CASA PRAIAMAR</p><h1>Página não encontrada.</h1><Link href="/">Voltar ao início <span aria-hidden>↗</span></Link></main>;
}
