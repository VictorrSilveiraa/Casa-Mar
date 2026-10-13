import { content } from "@/lib/content";
import { siteConfig } from "@/lib/site.config";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { BookingBar } from "@/components/BookingBar";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { SectionHeading } from "@/components/SectionHeading";
import { Lightbox } from "@/components/Lightbox";
import { FaqList } from "@/components/FaqList";
import { StickyCTA } from "@/components/StickyCTA";
import { SuitesShowcase } from "@/components/SuitesShowcase";
import styles from "./page.module.css";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: siteConfig.name,
  description: content.metadata.description,
  address: { "@type": "PostalAddress", addressLocality: "Acaraú", addressRegion: "CE", addressCountry: "BR" },
};

function TextLink({ href, children, external = false, focusBooking = false }: { href: string; children: React.ReactNode; external?: boolean; focusBooking?: boolean }) {
  return <a className={styles.textLink} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...(focusBooking ? { "data-focus-booking": true } : {})}>{children}<span aria-hidden="true">↗</span></a>;
}

export default function Home() {
  return <>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <Header />
    <main id="conteudo">
      <Hero />
      <BookingBar />

      <section id="a-casa" className={`${styles.section} ${styles.essence}`} aria-labelledby="essence-title">
        <div className={`${styles.container} ${styles.essenceGrid}`}>
          <div className={styles.essenceCopy}>
            <SectionHeading id="essence-title" eyebrow={content.essence.eyebrow} title={content.essence.title} />
            <div className={styles.paragraphs}>{content.essence.paragraphs.map((text) => <p key={text}>{text}</p>)}</div>
            <TextLink href="#ambientes">{content.essence.action}</TextLink>
          </div>
          <div className={styles.essenceImage}><ResponsiveImage image="garden" sizes="(max-width: 767px) 100vw, 45vw" /></div>
        </div>
      </section>

      <SuitesShowcase />

      <section id="diferenciais" className={styles.features} aria-labelledby="features-title">
        <div className={`${styles.container} ${styles.featuresLayout}`}>
          <div className={styles.featureImage}><ResponsiveImage image="featuresPortrait" sizes="(max-width: 767px) 100vw, (max-width: 1023px) 34vw, 28vw" /></div>
          <div className={styles.featureContent}>
            <SectionHeading id="features-title" eyebrow={content.features.eyebrow} title={content.features.title} className={styles.featureHeading} />
            <div className={styles.featureGrid}>{content.features.items.map((item) => <article className={styles.feature} data-feature-item key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
          </div>
        </div>
      </section>

      <section id="ambientes" className={`${styles.section} ${styles.environments}`} aria-labelledby="environments-title">
        <div className={styles.container}>
          <SectionHeading id="environments-title" eyebrow={content.environments.eyebrow} title={content.environments.title} description={content.environments.description} />
          <div className={styles.environmentGrid}>
            <article className={styles.poolArticle}>
              <div className={styles.poolImage}><ResponsiveImage image="poolNight" sizes="(max-width: 767px) 100vw, 65vw" /></div>
              <div className={styles.environmentCopy}><p className={styles.imageLabel}>{content.environments.items[0].label}</p><h3>{content.environments.items[0].title}</h3><p>{content.environments.items[0].description}</p></div>
            </article>
            <article className={styles.kitchenArticle}>
              <div className={styles.kitchenImage}><ResponsiveImage image="kitchen" sizes="(max-width: 767px) 100vw, 32vw" /></div>
              <div className={styles.environmentCopy}><p className={styles.imageLabel}>{content.environments.items[1].label}</p><h3>{content.environments.items[1].title}</h3><p>{content.environments.items[1].description}</p></div>
            </article>
          </div>
          <div className={styles.environmentTail}>
            <figure className={styles.socialFigure}><div className={styles.socialImage}><ResponsiveImage image="social" sizes="(max-width: 767px) 100vw, 45vw" /></div><figcaption>Ambientes sociais</figcaption></figure>
            <div className={styles.terraceCopy}><p className={styles.imageLabel}>{content.environments.items[2].label}</p><h3>{content.environments.items[2].title}</h3><p>{content.environments.items[2].description}</p><Lightbox label={content.environments.action} /></div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.hospitality}`} aria-labelledby="hospitality-title">
        <div className={`${styles.container} ${styles.hospitalityGrid}`}>
          <div className={styles.hospitalityImage}><ResponsiveImage image="socialPortrait" sizes="(max-width: 767px) 100vw, 38vw" /></div>
          <div className={styles.hospitalityCopy}><SectionHeading id="hospitality-title" eyebrow={content.hospitality.eyebrow} title={content.hospitality.title} /><div className={styles.paragraphs}>{content.hospitality.paragraphs.map((text) => <p key={text}>{text}</p>)}</div><p className={styles.hospitalityStatement}>{content.hospitality.statement}</p><div className={styles.serviceList}>{content.hospitality.services.map((item) => <span key={item}>{item}</span>)}</div></div>
        </div>
      </section>

      <section className={styles.lifestyle} aria-labelledby="lifestyle-title">
        <div className={styles.lifestyleImage}><ResponsiveImage image="dusk" sizes="100vw" /></div>
        <div className={`${styles.container} ${styles.lifestyleCopy}`}><SectionHeading id="lifestyle-title" eyebrow={content.lifestyle.eyebrow} title={content.lifestyle.title} /><div className={styles.paragraphs}>{content.lifestyle.paragraphs.map((text) => <p key={text}>{text}</p>)}</div><p className={styles.lifestyleStatement}>{content.lifestyle.statement}</p></div>
      </section>

      <section id="localizacao" className={`${styles.section} ${styles.location}`} aria-labelledby="location-title">
        <div className={`${styles.container} ${styles.locationGrid}`}>
          <div className={styles.locationCopy}><SectionHeading id="location-title" eyebrow={content.location.eyebrow} title={content.location.title} /><div className={styles.paragraphs}>{content.location.paragraphs.map((text) => <p key={text}>{text}</p>)}</div><p className={styles.locationHighlight}>{content.location.highlight}</p><TextLink href={siteConfig.locationUrl} external>{content.location.action}</TextLink></div>
          <div className={styles.locationImage}><ResponsiveImage image="lawnPortrait" sizes="(max-width: 767px) 100vw, 35vw" /></div>
        </div>
      </section>

      <section id="informacoes" className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title">
        <div className={`${styles.container} ${styles.faqGrid}`}><div><SectionHeading id="faq-title" eyebrow={content.faq.eyebrow} title={content.faq.title} /><TextLink href="#reservas" focusBooking>{content.faq.action}</TextLink></div><FaqList /></div>
      </section>

      <section className={styles.final} aria-labelledby="final-title">
        <ResponsiveImage image="heroDesktop" sizes="100vw" className={styles.finalImage} />
        <div className={styles.finalScrim} aria-hidden="true" />
        <div className={styles.finalCopy}><p className={styles.finalEyebrow}>{content.final.eyebrow}</p><h2 id="final-title">{content.final.title}</h2>{content.final.paragraphs.map((text) => <p key={text}>{text}</p>)}<a href="#reservas" data-focus-booking>{content.final.action}<span aria-hidden="true">↗</span></a></div>
      </section>
    </main>
    <footer id="rodape" className={styles.footer}><div className={styles.container}><div className={styles.footerTop}><div><a className={styles.footerBrand} href="#topo">CASA PRAIAMAR</a><p>{content.footer.statement}</p></div><nav aria-label="Navegação do rodapé">{content.footer.links.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</nav></div><div className={styles.footerBottom}><span>{content.footer.location}</span><span>© {new Date().getFullYear()} Casa Praiamar</span>{siteConfig.instagramHandle && <a href={`https://instagram.com/${siteConfig.instagramHandle}`} target="_blank" rel="noopener noreferrer">Instagram</a>}</div></div></footer>
    <StickyCTA />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  </>;
}
