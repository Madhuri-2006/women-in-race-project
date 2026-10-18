import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import { getAthletes } from "../services/athleteService";
import { getAthleteWikiProfile } from "../services/wikiService";
import { calculateAge, getInitials } from "../utils/athleteHelpers";
import { athleteStanding, relatedAthletes, totalMedals } from "../utils/athleteStats";
import CommunityLetters from "../components/CommunityLetters/CommunityLetters";
import "./AthleteDetails.css";

const MEDAL_ROWS = [
  { field: "olympicMedals", label: "Olympic Games", icon: "🏅" },
  { field: "worldChampionships", label: "World Championships", icon: "🌍" },
  { field: "commonwealthMedals", label: "Commonwealth Games", icon: "🏟️" },
  { field: "asianGamesMedals", label: "Asian Games", icon: "🌏" },
];

// Long sections stay collapsed so the page doesn't become one endless scroll.
const OPEN_SECTION_COUNT = 2;

function formatBirthDate(birthDate) {
  if (!birthDate) return null;
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return birthDate;
  // 1 January is how the dataset records "year known, day unknown".
  if (birthDate.endsWith("-01-01")) return String(date.getFullYear());
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function ordinal(n) {
  const suffix = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}

// Top-level (==) sections become collapsible chapters; deeper headings that
// follow are nested under the chapter they belong to. Empty chapters (pure
// headings with no text or subsections) are dropped.
function groupIntoChapters(sections) {
  const chapters = [];
  for (const section of sections) {
    if (section.level === 2 || chapters.length === 0) {
      chapters.push({ title: section.title, paragraphs: section.paragraphs, children: [] });
    } else if (section.paragraphs.length) {
      chapters[chapters.length - 1].children.push(section);
    }
  }
  return chapters.filter((c) => c.paragraphs.length || c.children.length);
}

function AthletePhoto({ athlete, wiki }) {
  const [localFailed, setLocalFailed] = useState(false);
  const [wikiFailed, setWikiFailed] = useState(false);

  if (athlete.image && !localFailed) {
    return (
      <>
        <img
          src={`/images/athletes/${athlete.image}`}
          alt={athlete.name}
          onError={() => setLocalFailed(true)}
        />
        {athlete.imageCredit && (
          <p className="details-image-credit">
            {athlete.imageSourceUrl ? (
              <a href={athlete.imageSourceUrl} target="_blank" rel="noopener noreferrer">
                {athlete.imageCredit}
              </a>
            ) : (
              athlete.imageCredit
            )}
          </p>
        )}
      </>
    );
  }

  if (wiki?.thumbnail && !wikiFailed) {
    return (
      <>
        <img src={wiki.thumbnail} alt={athlete.name} onError={() => setWikiFailed(true)} />
        <p className="details-image-credit">
          <a href={wiki.url} target="_blank" rel="noopener noreferrer">
            Photo via Wikipedia
          </a>
        </p>
      </>
    );
  }

  return <div className="details-image-fallback">{getInitials(athlete.name)}</div>;
}

function QuickFacts({ athlete, wiki }) {
  const age = calculateAge(athlete.birthDate);
  const facts = wiki?.facts || {};
  const born = [formatBirthDate(athlete.birthDate), facts.birthPlace].filter(Boolean).join(" · ");

  const rows = [
    ["Sport", athlete.sport],
    ["Age", age !== null ? `${age} years` : null],
    ["Born", born || null],
    ["Home state", athlete.state],
    ["Country", athlete.country],
    ["Coach", athlete.coach],
    ["Height", facts.height],
    ["Weight", facts.weight],
    ["Plays", facts.handedness],
  ].filter(([, value]) => value);

  return (
    <dl className="details-facts">
      {rows.map(([label, value]) => (
        <div key={label} className="details-fact">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function MedalStats({ athlete, standing }) {
  const max = Math.max(1, ...MEDAL_ROWS.map(({ field }) => Number(athlete[field]) || 0));

  return (
    <section className="details-section">
      <p className="details-eyebrow">BY THE NUMBERS</p>
      <h2 className="details-section-title">Career stats</h2>

      <div className="details-stat-grid">
        <div className="details-stat details-stat-total">
          <span className="details-stat-value">{standing.total}</span>
          <span className="details-stat-label">Major medals</span>
        </div>
        <div className="details-stat">
          <span className="details-stat-value">
            {ordinal(standing.sportRank)}
            <small> / {standing.sportCount}</small>
          </span>
          <span className="details-stat-label">Rank in {athlete.sport}</span>
        </div>
        <div className="details-stat">
          <span className="details-stat-value">
            {ordinal(standing.overallRank)}
            <small> / {standing.overallCount}</small>
          </span>
          <span className="details-stat-label">Rank across all sports</span>
        </div>
        <div className="details-stat">
          <span className="details-stat-value">{Math.round(standing.shareOfSportMedals * 100)}%</span>
          <span className="details-stat-label">Of {athlete.sport} medals on this site</span>
        </div>
      </div>

      <div className="details-medal-bars">
        {MEDAL_ROWS.map(({ field, label, icon }) => {
          const value = Number(athlete[field]) || 0;
          return (
            <div key={field} className="details-medal-row">
              <span className="details-medal-name">
                <span aria-hidden="true">{icon}</span> {label}
              </span>
              <span className="details-medal-track">
                <span
                  className="details-medal-fill"
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </span>
              <span className="details-medal-count">{value}</span>
            </div>
          );
        })}
      </div>

      <p className="details-stat-note">
        {standing.total > standing.sportAverage
          ? `${standing.total} major medals, against an average of ${standing.sportAverage.toFixed(1)} for the ${standing.sportCount} ${athlete.sport.toLowerCase()} athletes on this site.`
          : `The ${athlete.sport.toLowerCase()} athletes on this site average ${standing.sportAverage.toFixed(1)} major medals each.`}{" "}
        Counts cover the Olympics, World Championships, Commonwealth Games and Asian Games.
      </p>
    </section>
  );
}

function Backstory({ athlete, wiki, wikiStatus }) {
  if (wikiStatus === "loading") {
    return (
      <section className="details-section">
        <p className="details-eyebrow">HER STORY</p>
        <h2 className="details-section-title">Backstory</h2>
        <div className="details-skeleton" aria-label="Loading biography">
          <span />
          <span />
          <span />
        </div>
      </section>
    );
  }

  if (!wiki) {
    return (
      <section className="details-section">
        <p className="details-eyebrow">HER STORY</p>
        <h2 className="details-section-title">Backstory</h2>
        {athlete.bio && <p className="details-lead">{athlete.bio}</p>}
        <p className="details-paragraph">
          {athlete.name} represents {athlete.state ? `${athlete.state}, ` : ""}
          {athlete.country || "India"} in {athlete.sport.toLowerCase()}
          {athlete.coach ? `, training under ${athlete.coach}` : ""}.
          {totalMedals(athlete) > 0
            ? ` She has won ${totalMedals(athlete)} medals at major international multi-sport events and world championships.`
            : " She is one of the rising names in her sport and is still chasing her first major international medal."}
        </p>
        <p className="details-muted">
          A detailed public biography for {athlete.name} isn&apos;t available yet.
        </p>
      </section>
    );
  }

  const chapters = groupIntoChapters(wiki.sections);

  return (
    <section className="details-section">
      <p className="details-eyebrow">HER STORY</p>
      <h2 className="details-section-title">Backstory</h2>

      {wiki.lead.map((paragraph, i) => (
        <p key={i} className={i === 0 ? "details-lead" : "details-paragraph"}>
          {paragraph}
        </p>
      ))}

      <div className="details-chapters">
        {chapters.map((chapter, i) => (
          <details key={`${i}-${chapter.title}`} className="details-chapter" open={i < OPEN_SECTION_COUNT}>
            <summary>{chapter.title}</summary>
            {chapter.paragraphs.map((p, j) => (
              <p key={j} className="details-paragraph">{p}</p>
            ))}
            {chapter.children.map((child) => (
              <div key={child.title} className="details-subsection">
                <h4>{child.title}</h4>
                {child.paragraphs.map((p, j) => (
                  <p key={j} className="details-paragraph">{p}</p>
                ))}
              </div>
            ))}
          </details>
        ))}
      </div>

      <p className="details-attribution">
        Biography from{" "}
        <a href={wiki.url} target="_blank" rel="noopener noreferrer">
          Wikipedia
        </a>{" "}
        under{" "}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">
          CC BY-SA 4.0
        </a>
        . Height, weight and birthplace from Wikidata.
      </p>
    </section>
  );
}

function RelatedAthletes({ athletes }) {
  if (!athletes.length) return null;

  return (
    <section className="details-section">
      <p className="details-eyebrow">KEEP EXPLORING</p>
      <h2 className="details-section-title">More from {athletes[0].sport}</h2>
      <div className="details-related">
        {athletes.map((a) => (
          <Link key={a.id} to={`/athletes/${a.id}`} className="details-related-card">
            <span className="details-related-initials">{getInitials(a.name)}</span>
            <span className="details-related-name">{a.name}</span>
            <span className="details-related-meta">
              {a.state} · {totalMedals(a)} medals
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AthleteDetails() {
  const { id } = useParams();

  const [athletes, setAthletes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [wiki, setWiki] = useState(null);
  const [wikiStatus, setWikiStatus] = useState("loading");

  const athlete = athletes.find((item) => item.id === Number(id));

  useEffect(() => {
    let cancelled = false;
    getAthletes()
      .then((list) => {
        if (cancelled) return;
        setAthletes(list);
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("ready"));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!athlete) return undefined;
    let cancelled = false;
    setWiki(null);
    setWikiStatus("loading");
    window.scrollTo(0, 0);

    getAthleteWikiProfile(athlete)
      .then((profile) => !cancelled && setWiki(profile))
      .catch(() => !cancelled && setWiki(null))
      .finally(() => !cancelled && setWikiStatus("done"));

    return () => {
      cancelled = true;
    };
  }, [athlete]);

  if (status === "loading") {
    return (
      <Layout>
        <p className="details-status">Loading athlete…</p>
      </Layout>
    );
  }

  if (!athlete) {
    return (
      <Layout>
        <h1 className="details-status">Athlete Not Found</h1>
      </Layout>
    );
  }

  const standing = athleteStanding(athlete, athletes);

  return (
    <Layout>
      <div className="details-page">
        <div className="details-container">
          <div className="details-image">
            <AthletePhoto key={athlete.id} athlete={athlete} wiki={wiki} />
          </div>

          <div className="details-content">
            <p className="details-eyebrow">{athlete.sport.toUpperCase()}</p>
            <h1>{athlete.name}</h1>
            {(wiki?.description || athlete.bio) && (
              <p className="details-tagline">{wiki?.description || athlete.bio}</p>
            )}
            <QuickFacts athlete={athlete} wiki={wiki} />
          </div>
        </div>

        <MedalStats athlete={athlete} standing={standing} />
        <Backstory athlete={athlete} wiki={wiki} wikiStatus={wikiStatus} />
        <RelatedAthletes athletes={relatedAthletes(athlete, athletes)} />
      </div>

      <CommunityLetters athleteId={athlete.id} athleteName={athlete.name} />
    </Layout>
  );
}

export default AthleteDetails;
