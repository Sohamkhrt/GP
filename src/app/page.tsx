import { LandingFx } from "@/components/landing/LandingFx";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page} data-landing-root>
      <LandingFx />

      <div className={styles.shell}>
        <header className={styles.header}>
          <a className={styles.brand} href="#home" aria-label="GP">
            <span className={styles.brandMark}>GP</span>
            <span className={styles.brandTag}>Grand Prix Lab</span>
          </a>

          <div className={styles.headerActions}>
            <a className={styles.pill} href="#store">
              Store
            </a>
            <a className={styles.pillGhost} href="#features">
              Enter
            </a>
          </div>
        </header>

        <main className={styles.main} id="home">
          <div className={styles.grid}>
            <aside className={styles.rail}>
              <p className={styles.railLabel}>Pages</p>
              <nav className={styles.railNav} aria-label="Primary">
                <a href="#home">Home</a>
                <a href="#track">On Track</a>
                <a href="#garage">Off Track</a>
                <a href="#calendar">Calendar</a>
              </nav>
            </aside>

            <section className={styles.hero} aria-label="Hero">
              <h1 className={styles.title}>
                Always bringing
                <br />
                the <span className={styles.titleAccent}>fight</span>.
              </h1>
              <p className={styles.lede}>
                A racing-first, dark landing page with glowing pinstripes,
                track-light neon, and subtle depth.
              </p>

              <div className={styles.ctas}>
                <a className={styles.ctaPrimary} href="#track">
                  View the track
                </a>
                <a className={styles.ctaSecondary} href="#calendar">
                  Race calendar
                </a>
              </div>

              <div className={styles.visual} aria-hidden="true">
                <div className={styles.visualInner} />
              </div>
            </section>

            <aside className={styles.railRight}>
              <p className={styles.railLabel}>Follow on</p>
              <nav className={styles.railNav} aria-label="Social">
                <a
                  href="https://www.tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  TikTok
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube
                </a>
                <a
                  href="https://www.twitch.tv"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitch
                </a>
              </nav>
            </aside>
          </div>

          <section className={styles.features} id="features">
            <div className={styles.feature} id="track">
              <p className={styles.featureKicker}>On track</p>
              <h2 className={styles.featureTitle}>Grip, pace, and precision.</h2>
              <p className={styles.featureBody}>
                Pinstripe glow reacts to your cursor, like a moving apex light.
              </p>
            </div>

            <div className={styles.feature} id="garage">
              <p className={styles.featureKicker}>Off track</p>
              <h2 className={styles.featureTitle}>Built for late-night builds.</h2>
              <p className={styles.featureBody}>
                Dark surfaces, sharp contrast, and subtle motion tuned for focus.
              </p>
            </div>

            <div className={styles.feature} id="calendar">
              <p className={styles.featureKicker}>Calendar</p>
              <h2 className={styles.featureTitle}>Never miss lights out.</h2>
              <p className={styles.featureBody}>
                Drop in your schedule, add events, and keep the season in sync.
              </p>
            </div>
          </section>

          <section className={styles.sponsors} id="store" aria-label="Partners">
            <p className={styles.sponsorsLabel}>Partners</p>
            <ul className={styles.sponsorList}>
              <li>Quadrant</li>
              <li>Bell</li>
              <li>Tumi</li>
              <li>Pure Electric</li>
              <li>PAP</li>
              <li>Monster</li>
              <li>Hilton</li>
            </ul>
          </section>
        </main>

        <footer className={styles.footer}>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} GP.</p>
          <div className={styles.footerLinks}>
            <a href="#privacy">Privacy policy</a>
            <a href="#terms">Terms</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
