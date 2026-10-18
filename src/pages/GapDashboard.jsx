import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import Layout from "../components/Layout/Layout";
import { getAthletes } from "../services/athleteService";
import {
  countByState,
  countBySport,
  medalsBySport,
  summaryMetrics,
} from "../utils/athleteStats";
import {
  medalData,
  coverageData,
  coverageNote,
  sponsorData,
  participationData,
  stemPipelineData,
  startupStats,
  supportGaps,
  gapSolutions,
} from "../data/gapData";
import "./GapDashboard.css";

const SPORT_COLORS = [
  "#e11d85", "#6366f1", "#f59e0b", "#10b981", "#3b82f6",
  "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#a855f7",
];

const TOOLTIP_STYLE = {
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: "8px",
  color: "#f9fafb",
  fontFamily: "var(--font-body)",
  fontSize: "13px",
};

function KeyStat({ value, label, source }) {
  return (
    <div className="gap-stat-card">
      <div className="gap-stat-value">{value}</div>
      <p className="gap-stat-label">{label}</p>
      {source && <p className="gap-stat-source">Source: {source}</p>}
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="gap-section-header">
      {eyebrow && <p className="gap-eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {subtitle && <p className="gap-section-sub">{subtitle}</p>}
    </div>
  );
}

function GapDashboard() {
  const [copied, setCopied] = useState(false);
  const [athletes, setAthletes] = useState([]);
  const [dataStatus, setDataStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;
    getAthletes()
      .then((data) => {
        if (cancelled) return;
        setAthletes(data);
        setDataStatus("ready");
      })
      .catch((err) => {
        console.error("Gap Dashboard: failed to load athlete records", err);
        if (!cancelled) setDataStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => summaryMetrics(athletes), [athletes]);
  const stateRows = useMemo(() => countByState(athletes).slice(0, 10), [athletes]);
  const sportRows = useMemo(() => countBySport(athletes), [athletes]);
  const medalRows = useMemo(() => medalsBySport(athletes), [athletes]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const sortedSponsorData = [...sponsorData].sort((a, b) => b.sponsorship - a.sponsorship);

  return (
    <Layout>
      <div className="gap-page">
        <div className="gap-hero">
          <p className="gap-eyebrow">THE DATA STORY</p>
          <h1>
            The Gap Is <span className="accent">Real.</span>
          </h1>
          <p className="gap-hero-sub">
            Hard data on how women are represented in Indian sports, science, and tech —
            in medals, money, media, and the support system behind them. And what actually
            closes gaps like these.
          </p>
        </div>

        <div className="gap-stats-row">
          <KeyStat
            value="15%"
            label="Share of sports media coverage women's sports receive worldwide"
            source="2023 global sports-media coverage study"
          />
          <KeyStat
            value="18.6%"
            label="Women's share of India's R&D workforce — despite being 43% of STEM graduates"
            source="DST / AISHE"
          />
          <KeyStat
            value="100%"
            label="Share of India's Rio 2016 Olympic medal tally that was won by women"
            source="Olympics.com"
          />
          <KeyStat
            value="7.5%"
            label="Share of active Indian startups that are women-led"
            source="Tracxn, 2024"
          />
        </div>

        {/* Live section — computed from this platform's own athlete records */}
        <section className="gap-section">
          <SectionHeader
            eyebrow="FROM OUR OWN RECORDS"
            title="This Platform's Athlete Data"
            subtitle="Aggregated live from every athlete record in the database — not a static dataset."
          />

          {dataStatus === "loading" && (
            <p className="gap-source">Loading athlete records…</p>
          )}
          {dataStatus === "error" && (
            <p className="gap-source">Couldn't load athlete records right now.</p>
          )}

          {dataStatus === "ready" && (
            <>
              <div className="gap-stats-row gap-stats-row-secondary">
                <KeyStat value={String(metrics.athletes)} label="Women athletes profiled" />
                <KeyStat value={String(metrics.states)} label="States & UTs represented" />
                <KeyStat value={String(metrics.sports)} label="Sports covered" />
                <KeyStat
                  value={String(metrics.medals)}
                  label="International medals & titles across all records (Olympic, World, Commonwealth, Asian Games)"
                />
              </div>

              <div className="gap-live-grid">
                <div className="gap-chart-card">
                  <h3 className="gap-mini-title">Champions by State — Top 10</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={stateRows}
                      layout="vertical"
                      margin={{ top: 6, right: 24, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" stroke="#6b7280" fontSize={12} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="state"
                        stroke="#6b7280"
                        fontSize={11}
                        width={92}
                      />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      />
                      <Bar dataKey="count" name="Athletes" fill="#e11d85" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="gap-chart-card">
                  <h3 className="gap-mini-title">Distribution by Sport</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={sportRows}
                        dataKey="count"
                        nameKey="sport"
                        innerRadius={55}
                        outerRadius={105}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {sportRows.map((row, i) => (
                          <Cell key={row.sport} fill={SPORT_COLORS[i % SPORT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "#f9fafb" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="gap-chart-card">
                <h3 className="gap-mini-title">
                  International Medals &amp; Titles by Sport (from athlete records)
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={medalRows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="sport" stroke="#6b7280" fontSize={11} />
                    <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    />
                    <Bar dataKey="medals" name="Medals + titles" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="gap-insight">
                These four metrics and three charts are computed in the browser from live
                Firestore athlete records every time this page loads — state-wise counts,
                sport-wise distribution, and medal totals summed across four competition
                categories.
              </p>
            </>
          )}
        </section>

        {/* Chart 1 — Olympic Medals */}
        <section className="gap-section">
          <SectionHeader
            eyebrow="THE ACHIEVEMENT GAP"
            title="Olympic Medals Won by Indian Athletes — Women vs Men"
          />
          <div className="gap-chart-card">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={medalData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="games" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Legend wrapperStyle={{ fontSize: 13, color: "#f9fafb" }} />
                <Bar dataKey="women" name="Women" fill="#e11d85" radius={[4, 4, 0, 0]} />
                <Bar dataKey="men" name="Men" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="gap-insight">
            At Rio 2016, every single Olympic medal India won came from a woman — PV Sindhu
            and Sakshi Malik carried the entire tally. By Paris 2024 the count is more even,
            but women still won fewer medals than men in 4 of the last 6 Games.
          </p>
          <p className="gap-source">Source: Olympics.com, Indian Olympic medal records.</p>
        </section>

        {/* Chart 2 — Media Coverage */}
        <section className="gap-section">
          <SectionHeader
            eyebrow="THE RECOGNITION GAP"
            title="Sports Media Coverage — Gender Split"
          />
          <div className="gap-chart-card gap-donut-card">
            <div className="gap-donut-wrap">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={coverageData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={75}
                    outerRadius={110}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {coverageData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="gap-donut-center">
                <span className="gap-donut-figure">15%</span>
                <span className="gap-donut-vs">vs</span>
                <span className="gap-donut-figure gap-donut-figure-muted">85%</span>
              </div>
            </div>
            <div className="gap-donut-legend">
              <p>
                <span className="legend-dot" style={{ background: "#e11d85" }} /> Women's
                sports coverage — 15%
              </p>
              <p>
                <span className="legend-dot" style={{ background: "#6366f1" }} /> Men's sports
                coverage — 85%
              </p>
            </div>
          </div>
          <p className="gap-insight">{coverageNote}</p>
          <p className="gap-source">Source: 2023 global sports-media coverage study.</p>
        </section>

        {/* Chart 3 — Sponsorship */}
        <section className="gap-section">
          <SectionHeader
            eyebrow="THE OPPORTUNITY GAP"
            title="Estimated Annual Brand Endorsements (₹ Crore)"
          />
          <div className="gap-chart-card">
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                data={sortedSponsorData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="athlete"
                  stroke="#6b7280"
                  fontSize={12}
                  width={110}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="sponsorship" name="₹ Crore / year" radius={[0, 4, 4, 0]}>
                  {sortedSponsorData.map((entry) => (
                    <Cell key={entry.athlete} fill={entry.gender === "F" ? "#e11d85" : "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="gap-insight">
            Virat Kohli's estimated annual endorsements alone outstrip the combined total for
            every woman on this list — despite Mary Kom winning six world boxing
            championships.
          </p>
          <p className="gap-source">
            Illustrative estimates based on public reporting on athlete brand valuations, not
            audited figures.
          </p>
        </section>

        {/* Chart 4 — Participation Growth */}
        <section className="gap-section">
          <SectionHeader
            eyebrow="THE MOMENTUM"
            title="Women's Participation Growth by Sport (Indexed, 2000–2020)"
          />
          <div className="gap-chart-card">
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={participationData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#f9fafb" }} />
                <Area type="monotone" dataKey="cricket" stackId="1" stroke="#10b981" fill="#10b98155" name="Cricket" />
                <Area type="monotone" dataKey="badminton" stackId="1" stroke="#3b82f6" fill="#3b82f655" name="Badminton" />
                <Area type="monotone" dataKey="athletics" stackId="1" stroke="#f59e0b" fill="#f59e0b55" name="Athletics" />
                <Area type="monotone" dataKey="boxing" stackId="1" stroke="#ef4444" fill="#ef444455" name="Boxing" />
                <Area type="monotone" dataKey="wrestling" stackId="1" stroke="#8b5cf6" fill="#8b5cf655" name="Wrestling" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="gap-insight">
            Grassroots participation across every sport has grown 3–5x since 2000 — proof the
            appetite exists. Funding and media coverage haven't grown at the same pace.
          </p>
        </section>

        {/* Chart 5 — STEM leaky pipeline */}
        <section className="gap-section">
          <SectionHeader
            eyebrow="THE GAP ISN'T ONLY IN SPORTS"
            title="The STEM Pipeline — Where Women Actually Drop Off"
            subtitle="Women make up 43% of India's STEM graduates. Here's what happens after."
          />
          <div className="gap-chart-card">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={stemPipelineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={12} unit="%" />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Legend wrapperStyle={{ fontSize: 13, color: "#f9fafb" }} />
                <Bar dataKey="women" name="Women" fill="#e11d85" radius={[4, 4, 0, 0]} />
                <Bar dataKey="men" name="Men" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="gap-insight">
            The gap isn't at the entry point — it's in who gets to stay. Women's share nearly
            halves between graduation and the R&D workforce, and halves again at premier
            institutes like the IITs and IISc.
          </p>
          <p className="gap-source">
            Source: DST / AISHE data via IMPRI policy analysis; ThePrint (2019 faculty study).
          </p>
        </section>

        {/* Startup funding */}
        <section className="gap-section">
          <SectionHeader
            eyebrow="THE OPPORTUNITY GAP, IN TECH"
            title="Women-Led Startup Funding in India"
          />
          <div className="gap-stats-row gap-stats-row-secondary">
            {startupStats.map((stat) => (
              <KeyStat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
          <p className="gap-source">Source: Inc42 / Tracxn / YourStory, 2024–25 reporting.</p>
        </section>

        {/* Support gap */}
        <section className="gap-section">
          <SectionHeader
            eyebrow="THE SUPPORT GAP"
            title="Where the Gap Isn't About Talent"
            subtitle="The structural realities behind the numbers above."
          />
          <div className="gap-support-grid">
            {supportGaps.map((item) => (
              <div className="gap-support-card" key={item.factor}>
                <h3>{item.factor}</h3>
                <div className="gap-support-row">
                  <span className="gap-support-tag gap-support-tag-men">Men</span>
                  <p>{item.men}</p>
                </div>
                <div className="gap-support-row">
                  <span className="gap-support-tag gap-support-tag-women">Women</span>
                  <p>{item.women}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ways to reduce the gap */}
        <section className="gap-section">
          <SectionHeader
            eyebrow="WHAT ACTUALLY CLOSES A GAP"
            title="Ways to Reduce It"
            subtitle="Not slogans — the specific, structural changes that have worked wherever this gap has narrowed."
          />
          <div className="gap-solutions-grid">
            {gapSolutions.map((solution, i) => (
              <div className="gap-solution-card" key={solution.title}>
                <span className="gap-solution-index">{String(i + 1).padStart(2, "0")}</span>
                <h3>{solution.title}</h3>
                <p>{solution.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="gap-cta">
          <h2>Share this dashboard.</h2>
          <p>The more people see the data, the faster things change.</p>
          <button type="button" className="gap-share-btn" onClick={handleShare}>
            {copied ? "Link copied!" : "Share this →"}
          </button>
        </section>
      </div>
    </Layout>
  );
}

export default GapDashboard;
