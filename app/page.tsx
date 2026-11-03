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
import { Footer } from "@/components/Footer";
import { EssenceSection } from "@/components/EssenceSection";
import styles from "./page.module.css";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: siteConfig.name,
  description: content.metadata.description,
  address: { "@type": "PostalAddress", addressLocality: "Acaraú", addressRegion: "CE", addressCountry: "BR" },
};

function TextLink({ href, children, external = false, focusBooking = false }: { href: string; children: React.ReactNode; external?: boolean; focusBooking?: boolean }) {
  return <a className={styles.textLink} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...(focusBooking ? { "data-focus-booking": true } : {})}>{children}</a>;
}

export default function Home() {
  return <>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <Header />
    <main id="conteudo">
      <Hero />
      <BookingBar />

      <EssenceSection />

      <SuitesShowcase />

      <section id="diferenciais" className={styles.features} aria-labelledby="features-title">
        <div className={`${styles.container} ${styles.featuresLayout}`}>
          <div className={styles.featureImage}><ResponsiveImage image="featuresPortrait" sizes="(max-width: 767px) 100vw, (max-width: 1023px) 34vw, 28vw" /></div>
          <div className={styles.featureContent}>
            <SectionHeading id="features-title" title={content.features.title} className={styles.featureHeading} />
            <div className={styles.featureGrid}>{content.features.items.map((item) => <article className={styles.feature} data-feature-item key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
          </div>
        </div>
      </section>

      <section id="ambientes" className={`${styles.section} ${styles.environments}`} aria-labelledby="environments-title">
        <div className={styles.environmentContainer}>
          <div className={styles.environmentHeader}><SectionHeading id="environments-title" title={content.environments.title} /></div>
          <div className={styles.environmentGrid}>
            <article className={styles.environmentItem} data-environment-item>
              <div className={styles.environmentImage}><ResponsiveImage image="environmentPool" sizes="(max-width: 767px) 200vw, 66vw" /></div>
              <div className={styles.environmentCopy}><h3>{content.environments.items[0].label}</h3><p>{content.environments.items[0].description}</p></div>
            </article>
            <article className={styles.environmentItem} data-environment-item>
              <div className={styles.environmentImage}><ResponsiveImage image="environmentKitchen" sizes="(max-width: 767px) 200vw, 66vw" /></div>
              <div className={styles.environmentCopy}><h3>{content.environments.items[1].label}</h3><p>{content.environments.items[1].description}</p></div>
            </article>
            <article className={styles.environmentItem} data-environment-item>
              <div className={styles.environmentImage}><ResponsiveImage image="environmentTerrace" sizes="(max-width: 767px) 100vw, 33vw" /></div>
              <div className={styles.environmentCopy}><h3>{content.environments.items[2].label}</h3><p>{content.environments.items[2].description}</p></div>
            </article>
          </div>
          <div className={styles.environmentAction}><Lightbox label={content.environments.action} /></div>
        </div>
      </section>

      <section id="hospitalidade" className={`${styles.section} ${styles.hospitality}`} aria-labelledby="hospitality-title">
        <div className={`${styles.container} ${styles.hospitalityGrid}`}>
          <div className={styles.hospitalityImage}><ResponsiveImage image="socialPortrait" sizes="(max-width: 767px) 100vw, 42vw" /></div>
          <div className={styles.hospitalityCopy}><SectionHeading id="hospitality-title" title={content.hospitality.title} /><div className={styles.paragraphs}>{content.hospitality.paragraphs.map((text) => <p key={text}>{text}</p>)}</div></div>
        </div>
      </section>

      <section id="experiencias" className={styles.lifestyle} aria-labelledby="lifestyle-title">
        <div className={styles.lifestyleImage}><ResponsiveImage image="dusk" sizes="100vw" /></div>
        <div className={styles.lifestyleScrim} aria-hidden="true" />
        <div className={`${styles.container} ${styles.lifestyleInner}`}>
          <div className={styles.lifestyleCopy}>
            <SectionHeading id="lifestyle-title" title={content.lifestyle.title} />
            <p className={styles.lifestyleDescription}>{content.lifestyle.description}</p>
            <a href="/experiencias">{content.lifestyle.action}</a>
          </div>
        </div>
      </section>

      <section id="localizacao" className={`${styles.section} ${styles.location}`} aria-labelledby="location-title">
        <div className={`${styles.container} ${styles.locationGrid}`}>
          <div className={styles.locationCopy}><SectionHeading id="location-title" title={content.location.title} /><div className={styles.paragraphs}>{content.location.paragraphs.map((text) => <p key={text}>{text}</p>)}</div><div className={styles.locationMeta} data-location-meta><p>{content.location.highlight}</p><TextLink href={siteConfig.locationUrl} external>{content.location.action}</TextLink></div></div>
          <div className={styles.locationImage}><ResponsiveImage image="lawnPortrait" sizes="(max-width: 767px) 100vw, 35vw" /></div>
        </div>
      </section>

      <section id="informacoes" className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title">
        <div className={`${styles.container} ${styles.faqGrid}`}><div><SectionHeading id="faq-title" title={content.faq.title} /><TextLink href="#reservas" focusBooking>{content.faq.action}</TextLink></div><FaqList /></div>
      </section>

      <section className={styles.final} aria-labelledby="final-title">
        <ResponsiveImage image="finalGarden" sizes="100vw" className={styles.finalImage} />
        <div className={styles.finalScrim} aria-hidden="true" />
        <div className={styles.finalCopy}><p className={styles.finalEyebrow}>{content.final.eyebrow}</p><h2 id="final-title">{content.final.title}</h2>{content.final.paragraphs.map((text) => <p key={text}>{text}</p>)}<a href="#reservas" data-focus-booking>{content.final.action}</a></div>
      </section>
    </main>
    <Footer />
    <StickyCTA />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  </>;
}
