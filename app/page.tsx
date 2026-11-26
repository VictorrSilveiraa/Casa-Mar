import { content } from "@/lib/content";
import { siteConfig } from "@/lib/site.config";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { SectionHeading } from "@/components/SectionHeading";
import { Lightbox } from "@/components/Lightbox";
import { FaqList } from "@/components/FaqList";
import { SuitesShowcase } from "@/components/SuitesShowcase";
import { Footer } from "@/components/Footer";
import { ReserveLink } from "@/components/ReserveLink";
import { LocationSection } from "@/components/LocationSection";
import styles from "./page.module.css";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: siteConfig.name,
  description: content.metadata.description,
  address: { "@type": "PostalAddress", addressLocality: "Acaraú", addressRegion: "CE", addressCountry: "BR" },
};

function TextLink({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) {
  return <a className={styles.textLink} data-fill href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a>;
}

export default function Home() {
  return <>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <Header />
    <main id="conteudo">
      <Hero />

      <section id="a-casa" className={`${styles.section} ${styles.essence}`} aria-labelledby="essence-title">
        <div className={`${styles.container} ${styles.essenceGrid}`}>
          <div className={styles.essenceCopy} data-essence-copy>
            <SectionHeading id="essence-title" title={content.essence.title} />
            <div className={styles.paragraphs} data-reveal="fade" style={{ "--reveal-delay": "200ms" } as React.CSSProperties}>{content.essence.paragraphs.map((text) => <p key={text}>{text}</p>)}</div>
            <div data-reveal="fade" style={{ "--reveal-delay": "320ms" } as React.CSSProperties}><TextLink href="#ambientes">{content.essence.action}</TextLink></div>
          </div>
          <div className={styles.essenceImage} data-essence-image data-reveal="image"><ResponsiveImage image="garden" sizes="(max-width: 767px) 100vw, 48vw" /></div>
        </div>
      </section>

      <SuitesShowcase />

      <section id="diferenciais" className={styles.features} aria-labelledby="features-title">
        <div className={`${styles.container} ${styles.featuresLayout}`}>
          <div className={styles.featureImage} data-reveal="image"><ResponsiveImage image="featuresPortrait" sizes="(max-width: 767px) 100vw, (max-width: 1023px) 34vw, 28vw" /></div>
          <div className={styles.featureContent}>
            <SectionHeading id="features-title" title={content.features.title} className={styles.featureHeading} />
            <div className={styles.featureGrid}>{content.features.items.map((item, index) => <article className={styles.feature} data-feature-item data-reveal="rule" style={{ "--reveal-delay": `${[0, 120, 220, 300][index] ?? 300}ms` } as React.CSSProperties} key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
          </div>
        </div>
      </section>

      <section id="ambientes" className={`${styles.section} ${styles.environments}`} aria-labelledby="environments-title">
        <div className={styles.environmentContainer}>
          <div className={styles.environmentHeader}><SectionHeading id="environments-title" title={content.environments.title} /></div>
          <div className={styles.environmentGrid}>
            <article className={styles.environmentItem} data-environment-item>
              <div className={styles.environmentImage} data-reveal="image"><ResponsiveImage image="environmentPool" sizes="(max-width: 767px) 200vw, 66vw" /></div>
              <div className={styles.environmentCopy} data-reveal="fade" style={{ "--reveal-delay": "160ms" } as React.CSSProperties}><h3>{content.environments.items[0].label}</h3><p>{content.environments.items[0].description}</p></div>
            </article>
            <article className={styles.environmentItem} data-environment-item>
              <div className={styles.environmentImage} data-reveal="image" style={{ "--reveal-delay": "140ms" } as React.CSSProperties}><ResponsiveImage image="environmentKitchen" sizes="(max-width: 767px) 200vw, 66vw" /></div>
              <div className={styles.environmentCopy} data-reveal="fade" style={{ "--reveal-delay": "300ms" } as React.CSSProperties}><h3>{content.environments.items[1].label}</h3><p>{content.environments.items[1].description}</p></div>
            </article>
            <article className={styles.environmentItem} data-environment-item>
              <div className={styles.environmentImage} data-reveal="image" style={{ "--reveal-delay": "240ms" } as React.CSSProperties}><ResponsiveImage image="environmentTerrace" sizes="(max-width: 767px) 100vw, 33vw" /></div>
              <div className={styles.environmentCopy} data-reveal="fade" style={{ "--reveal-delay": "400ms" } as React.CSSProperties}><h3>{content.environments.items[2].label}</h3><p>{content.environments.items[2].description}</p></div>
            </article>
          </div>
          <div className={styles.environmentAction} data-reveal="fade"><Lightbox label={content.environments.action} gallery="ambientes" /></div>
        </div>
      </section>

      <section id="hospitalidade" className={`${styles.section} ${styles.hospitality}`} aria-labelledby="hospitality-title">
        <div className={`${styles.container} ${styles.hospitalityGrid}`}>
          <div className={styles.hospitalityImage} data-reveal="image-x"><ResponsiveImage image="socialPortrait" sizes="(max-width: 767px) 100vw, 42vw" /></div>
          <div className={styles.hospitalityCopy}><SectionHeading id="hospitality-title" title={content.hospitality.title} /><div className={styles.paragraphs} data-reveal="fade" style={{ "--reveal-delay": "200ms" } as React.CSSProperties}>{content.hospitality.paragraphs.map((text) => <p key={text}>{text}</p>)}</div></div>
        </div>
      </section>

      <section id="experiencias" className={styles.lifestyle} aria-labelledby="lifestyle-title">
        <div className={styles.lifestyleImage} data-reveal="window"><ResponsiveImage image="dusk" sizes="100vw" /></div>
        <div className={styles.lifestyleScrim} aria-hidden="true" />
        <div className={`${styles.container} ${styles.lifestyleInner}`}>
          <div className={styles.lifestyleCopy}>
            <SectionHeading id="lifestyle-title" title={content.lifestyle.title} />
            <p className={styles.lifestyleDescription} data-reveal="fade" style={{ "--reveal-delay": "250ms" } as React.CSSProperties}>{content.lifestyle.description}</p>
            <div data-reveal="fade" style={{ "--reveal-delay": "360ms" } as React.CSSProperties}><Lightbox label={content.lifestyle.action} gallery="ambientes" className={styles.lifestyleAction} /></div>
          </div>
        </div>
      </section>

      <LocationSection />

      <section id="informacoes" className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title">
        <div className={`${styles.container} ${styles.faqGrid}`}><div><SectionHeading id="faq-title" title={content.faq.title} /><div data-reveal="fade" style={{ "--reveal-delay": "200ms" } as React.CSSProperties}><ReserveLink className={styles.textLink} source="faq" fill>{content.faq.action}</ReserveLink></div></div><FaqList /></div>
      </section>

      <section className={styles.final} aria-labelledby="final-title" data-reveal="settle">
        <ResponsiveImage image="finalGarden" sizes="100vw" className={styles.finalImage} />
        <div className={styles.finalScrim} aria-hidden="true" />
        <div className={styles.finalCopy}><p className={styles.finalEyebrow} data-reveal="fade">{content.final.eyebrow}</p><h2 id="final-title" data-reveal="lines" style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>{content.final.title}</h2><div data-reveal="fade" style={{ "--reveal-delay": "300ms" } as React.CSSProperties}>{content.final.paragraphs.map((text) => <p key={text}>{text}</p>)}<ReserveLink source="final" fill>{content.final.action}</ReserveLink></div></div>
      </section>
    </main>
    <Footer />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  </>;
}
