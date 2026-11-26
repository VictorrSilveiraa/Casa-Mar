import { content } from "@/lib/content";
import { nearbyPoints } from "@/lib/location";
import { SectionHeading } from "./SectionHeading";
import { LocationGlyph } from "./LocationIcons";
import { LocationMap } from "./LocationMap";
import { DirectionsDialog } from "./DirectionsDialog";
import styles from "./LocationSection.module.css";

const copy = content.location;
const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

export function LocationSection() {
  return (
    <section id="localizacao" className={styles.section} aria-labelledby="location-title">
      <div className={styles.grid}>
        <div className={styles.copy}>
          <SectionHeading id="location-title" eyebrow={copy.eyebrow} title={copy.title} />
          <div data-reveal="fade" style={delay(200)}>
            <p className={styles.description}>{copy.description}</p>
            <p className={styles.place} data-location-place><LocationGlyph name="pin" className={styles.placeIcon} />{copy.place}</p>
          </div>
          <ul className={styles.points} aria-label={copy.pointsLabel}>
            {nearbyPoints.map((point, index) => (
              <li key={point.label} className={styles.point} data-location-point data-reveal="rule" style={delay(120 + index * 90)}>
                <LocationGlyph name={point.icon} className={styles.pointIcon} />
                <span>{point.label}{point.detail && <><span className={styles.separator} aria-hidden="true"> · </span><span className={styles.detail}><span className={styles.srOnly}>, a </span>{point.detail}</span></>}</span>
              </li>
            ))}
          </ul>
          <div className={styles.actions} data-reveal="fade" style={delay(320)}>
            <DirectionsDialog label={copy.action} className={styles.action} />
          </div>
        </div>
        <div className={styles.map} data-reveal="fade" style={delay(160)}>
          <LocationMap />
        </div>
      </div>
    </section>
  );
}
