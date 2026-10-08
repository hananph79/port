import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  MotionConfig,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  Download,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Check,
  Send,
  Plus,
  MoveUpRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import {
  profile,
  skills,
  tools,
  experience,
  achievements,
  education,
  certifications,
} from "./content";

const resumeUrl = "/peerzada-abdul-hanan-resume.pdf";
const ease = [0.22, 1, 0.36, 1] as const;
const brandPaths: Record<string, string> = {
  "Meta Ads Manager":
    "M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303z",
  "Google Analytics":
    "M22.84 2.9982v17.9987c.0086 1.6473-1.3197 2.9897-2.967 2.9984a2.9808 2.9808 0 01-.3677-.0208c-1.528-.226-2.6477-1.5558-2.6105-3.1V3.1204c-.0369-1.5458 1.0856-2.8762 2.6157-3.1 1.6361-.1915 3.1178.9796 3.3093 2.6158.014.1201.0208.241.0202.3619zM4.1326 18.0548c-1.6417 0-2.9726 1.331-2.9726 2.9726C1.16 22.6691 2.4909 24 4.1326 24s2.9726-1.3309 2.9726-2.9726-1.331-2.9726-2.9726-2.9726zm7.8728-9.0098c-.0171 0-.0342 0-.0513.0003-1.6495.0904-2.9293 1.474-2.891 3.1256v7.9846c0 2.167.9535 3.4825 2.3505 3.763 1.6118.3266 3.1832-.7152 3.5098-2.327.04-.1974.06-.3983.0593-.5998v-8.9585c.003-1.6474-1.33-2.9852-2.9773-2.9882z",
  Filmora:
    "M5.475 0A5.463 5.463 0 0 0 0 5.475v13.05A5.463 5.463 0 0 0 5.475 24h13.05A5.463 5.463 0 0 0 24 18.525V5.475A5.463 5.463 0 0 0 18.525 0H5.475Zm4.552 3.6 4.026 4.029-4.617 4.623-.022-.023a1.088 1.088 0 0 0-.158-1.339L5.999 7.63l4.028-4.03ZM14.528 8l4.027 4.03-8.528 8.536L6 16.536 14.528 8Z",
  "Sprinklr & HootSuite":
    "M11.417 11.14c.505.75.28 1.572-.38 2.017-.66.444-1.505.343-2.01-.407-.506-.75-.282-1.572.378-2.017.66-.444 1.506-.343 2.012.407zm5.017-.274c-.66.444-.884 1.266-.379 2.016.506.75 1.352.852 2.012.407.66-.444.884-1.266.379-2.016-.506-.75-1.352-.852-2.012-.407zM23.856 3.78 19.03 6.638l.236.272c2.224 2.613 3.591 6.409 4.247 8.606a4.362 4.362 0 0 1-.638 3.8C21.449 21.295 18.398 24 12.369 24c-6.58 0-10-3.25-11.644-5.251a3.117 3.117 0 0 1-.51-3.067c.909-2.444 2.766-7.126 4.257-8.825a13.158 13.158 0 0 1 2.897-2.478L2.4.534c-.27-.208-.034-.632.285-.513l8.077 3.006c.38-.066.758-.1 1.13-1.084l7.744-.695c.266-.024.378.331.147.464z",
};
const brandFiles: Record<string, string> = {
  Canva: "/logos/canva.svg",
  "Adobe Premiere Pro": "/logos/adobe-premiere.svg",
  "Outlook & Sharepoint": "/logos/microsoft.svg",
  "Sprinklr & HootSuite": "/logos/hootsuite.svg",
};
function ToolLogo({ tool }: { tool: string }) {
  if (brandFiles[tool])
    return (
      <img
        className="tool-logo tool-image"
        src={brandFiles[tool]}
        alt=""
        aria-hidden="true"
      />
    );
  const path = brandPaths[tool];
  if (path)
    return (
      <svg className="tool-logo" viewBox="0 0 24 24" aria-hidden="true">
        <path d={path} />
      </svg>
    );
  const name = tool.toLowerCase().replace(/[^a-z]/g, "");
  if (tool === "Canva")
    return (
      <svg
        className="tool-logo tool-canva"
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="canvaGradient" x1="3" x2="29" y1="4" y2="28">
            <stop stopColor="#00c4cc" />
            <stop offset="1" stopColor="#7d2ae8" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="15" fill="url(#canvaGradient)" />
        <path
          fill="white"
          d="M22.8 12.4c-1.2-2-3.1-3.2-5.6-3.2-3.8 0-6.8 2.9-6.8 6.8s3 6.8 6.8 6.8c2.5 0 4.5-1.2 5.7-3.3l-2.7-1.4c-.7 1.1-1.6 1.7-2.9 1.7-1.8 0-3.1-1.5-3.1-3.8s1.3-3.8 3.1-3.8c1.2 0 2.2.6 2.9 1.7z"
        />
      </svg>
    );
  if (tool === "Adobe Premiere Pro")
    return (
      <svg
        className={`tool-logo tool-${name}`}
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="3" fill="#30205e" />
        <text
          x="4"
          y="22"
          fill="#e8d9ff"
          fontFamily="Arial,sans-serif"
          fontSize="13"
          fontWeight="700"
        >
          Pr
        </text>
      </svg>
    );
  if (tool === "Camtasia")
    return (
      <svg
        className={`tool-logo tool-${name}`}
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="7" fill="#39a96b" />
        <path fill="white" d="M7 10h12v3H10v6h9v3H7z" />
        <circle cx="24" cy="16" r="4" fill="#b9ef75" />
      </svg>
    );
  if (tool === "Clipchamp")
    return (
      <svg
        className={`tool-logo tool-${name}`}
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="7" fill="#137c8b" />
        <path fill="white" d="m12 8 12 8-12 8z" />
        <circle cx="9" cy="16" r="3" fill="#79e0d4" />
      </svg>
    );
  if (tool === "MS Word")
    return (
      <svg
        className={`tool-logo tool-${name}`}
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="3" fill="#185abd" />
        <path
          fill="white"
          d="M7 9h4l2 10 2-7h3l2 7 2-10h4l-3 14h-5l-2-7-2 7h-5z"
        />
      </svg>
    );
  if (tool === "Microsoft Excel")
    return (
      <svg
        className={`tool-logo tool-${name}`}
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="3" fill="#107c41" />
        <path
          fill="white"
          d="M7 8h4l3.5 5.5L18 8h4l-5.2 8 5.4 8h-4l-3.7-5.6L11 24H7l5.5-8z"
        />
      </svg>
    );
  if (tool === "PowerPoint")
    return (
      <svg
        className={`tool-logo tool-${name}`}
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="3" fill="#c43e1c" />
        <path
          fill="white"
          d="M8 24V8h7c4.2 0 6.8 2.2 6.8 5.8s-2.6 5.8-6.8 5.8h-3V24zm4-7.8h2.7c1.9 0 3-1 3-2.4s-1.1-2.4-3-2.4H12z"
        />
      </svg>
    );
  if (tool === "Outlook & Sharepoint")
    return (
      <svg
        className={`tool-logo tool-${name}`}
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="13" height="13" fill="#f25022" />
        <rect x="17" y="2" width="13" height="13" fill="#7fba00" />
        <rect x="2" y="17" width="13" height="13" fill="#00a4ef" />
        <rect x="17" y="17" width="13" height="13" fill="#ffb900" />
      </svg>
    );
  return (
    <span className={`tool-monogram tool-${name}`} aria-hidden="true">
      M
    </span>
  );
}
const links = [
  { name: "Selected work", id: "work" },
  { name: "About", id: "about" },
  { name: "Experience", id: "experience" },
  { name: "Expertise", id: "skills" },
];
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: reduced ? 0 : 0.7,
        ease,
        delay: reduced ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}
function Number({
  value,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const { ref, inView } = useInView({ triggerOnce: true });
  const reduced = useReducedMotion();
  return (
    <span ref={ref} aria-label={`${value.toLocaleString()}${suffix}`}>
      <span aria-hidden="true">
        {reduced ? (
          `${value.toLocaleString(undefined, { minimumFractionDigits: decimals })}${suffix}`
        ) : (
          <CountUp
            end={inView ? value : 0}
            suffix={suffix}
            decimals={decimals}
            separator=","
            duration={1.6}
          />
        )}
      </span>
    </span>
  );
}
function SectionTitle({
  number,
  label,
  children,
  description,
}: {
  number: string;
  label: string;
  children: ReactNode;
  description?: string;
}) {
  return (
    <Reveal className="section-heading">
      <div>
        <span className="section-label">
          {number} / {label}
        </span>
        <h2>{children}</h2>
      </div>
      {description && <p>{description}</p>}
    </Reveal>
  );
}
function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const reduced = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusAfterClose = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30 });
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        }),
      { rootMargin: "-15% 0px -60% 0px" },
    );
    document
      .querySelectorAll("main > section[id]")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!open) {
      focusAfterClose.current?.focus({ preventScroll: true });
      focusAfterClose.current = null;
      return;
    }
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
      if (event.key === "Tab") {
        const targets = Array.from(
          panelRef.current?.querySelectorAll<HTMLElement>("a, button") ?? [],
        );
        const first = targets[0],
          last = targets[targets.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const onResize = () => {
      if (innerWidth >= 1000) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);
  function closeMenu() {
    focusAfterClose.current = buttonRef.current;
    setOpen(false);
  }
  function navigate(id: string) {
    focusAfterClose.current = document.getElementById(id);
    setOpen(false);
  }
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <a
          href="#home"
          className="brand"
          aria-label="Peerzada Abdul Hanan, home"
        >
          hanan<span>✦</span>
          <small>STRATEGY & STORIES</small>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              aria-current={active === link.id ? "location" : undefined}
            >
              {link.name}
            </a>
          ))}
        </nav>
        <a className="nav-connect" href="#contact">
          Let’s talk <ArrowUpRight size={18} />
        </a>
        <button
          ref={buttonRef}
          className="mobile-toggle"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-hidden={open}
          tabIndex={open ? -1 : 0}
          aria-controls="mobile-menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <motion.div
        className="reading-progress"
        aria-hidden="true"
        style={{ scaleX: reduced ? scrollYProgress : progress }}
      />
      {open && (
        <motion.div
          ref={panelRef}
          id="mobile-menu"
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          initial={reduced ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="menu-heading">
            <span className="section-label">Find your chapter</span>
            <button
              className="menu-close"
              aria-label="Close navigation"
              onClick={closeMenu}
            >
              <X />
            </button>
          </div>
          {[...links, { name: "Contact", id: "contact" }].map((link, i) => (
            <a
              href={`#${link.id}`}
              key={link.id}
              onClick={() => navigate(link.id)}
            >
              <small>0{i + 1}</small>
              {link.name}
              <ArrowUpRight />
            </a>
          ))}
          <a href={resumeUrl} download className="menu-resume">
            Download Resume <Download size={18} />
          </a>
        </motion.div>
      )}
    </header>
  );
}
function Hero() {
  const reduced = useReducedMotion();
  return (
    <section id="home" tabIndex={-1} className="hero">
      <div className="container">
        <div className="hero-topline">
          <span>DIGITAL MARKETING & CONTENT</span>
          <span>
            <i /> Open to opportunities
          </span>
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <motion.h1
              initial={reduced ? false : "hidden"}
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.12 } },
              }}
            >
              {["Good stories.", "Real connections."].map((line) => (
                <span className="line-mask" key={line}>
                  <motion.span
                    variants={{ hidden: { y: "110%" }, visible: { y: 0 } }}
                    transition={{ duration: reduced ? 0 : 0.8, ease }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
              <span className="line-mask">
                <motion.em
                  variants={{ hidden: { y: "110%" }, visible: { y: 0 } }}
                  transition={{ duration: reduced ? 0 : 0.8, ease }}
                >
                  Lasting impact.
                </motion.em>
              </span>
            </motion.h1>
            <Reveal delay={0.2} className="hero-intro">
              <span className="intro-rule" />
              <p>
                I’m <strong>Peerzada Abdul Hanan.</strong>
                <br />I connect brands with people through thoughtful strategy,
                compelling content, and stories worth sharing.
              </p>
            </Reveal>
            <Reveal delay={0.3} className="hero-actions">
              <a className="button button-dark" href="#work">
                Explore my work <ArrowDown size={18} />
              </a>
              <a className="text-link" href={resumeUrl} download>
                Download Resume <Download size={16} />
              </a>
            </Reveal>
          </div>
          <Reveal className="hero-art" delay={0.25}>
            <div className="portrait-frame">
              <img
                src="/WhatsApp%20Image%202026-10-08%20at%2021.31.24.jpeg"
                alt="Hanan looking out over the city from a terrace"
              />
              <div className="portrait-label">
                <span>PEERZADA ABDUL HANAN</span>
                <span>01—03</span>
              </div>
            </div>
            <div className="result-ticket">
              <span className="ticket-icon">
                <ArrowUpRight />
              </span>
              <div>
                <strong>1.5M+</strong>
                <span>content views. real attention.</span>
              </div>
              <span className="ticket-caption">THE IMPACT</span>
            </div>
          </Reveal>
        </div>
        <div className="hero-bottom">
          <span>
            <MapPin size={14} /> Bengaluru, India
          </span>
          <span>3+ YEARS OF TURNING IDEAS INTO IMPACT</span>
          <a href="#work" aria-label="Scroll to selected work">
            <ArrowDown size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
function BrandStrip() {
  return (
    <div className="brand-strip">
      <div className="container">
        <span className="section-label">Experience across</span>
        <div className="company-names">
          <span>
            Inventure<span className="company-small">ACADEMY</span>
          </span>
          <span>Schneider Electric</span>
          <span>Nurture Careers</span>
          <span>AXIS BANK</span>
        </div>
      </div>
    </div>
  );
}
function Work() {
  return (
    <section id="work" tabIndex={-1} className="section-space work">
      <div className="container">
        <SectionTitle
          number="01"
          label="Selected work"
          description="A closer look at the brands, communities, and conversations I’ve helped grow."
        >
          Strategy in action.
          <br />
          <em>Stories with substance.</em>
        </SectionTitle>
        <div className="work-grid">
          <Reveal>
            <article className="work-card">
              <div className="work-art work-art-school">
                <div className="work-art-meta">
                  <span>INVENTURE ACADEMY</span>
                  <span>PORTFOLIO ILLUSTRATION</span>
                </div>
                <div className="school-poster">
                  <span className="micro-label">
                    ON CAMPUS. ONLINE. IN THE MOMENT.
                  </span>
                  <strong>
                    Every day,
                    <br />a new <em>story.</em>
                  </strong>
                  <div className="school-lines" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="art-footnote">
                    SOCIAL STRATEGY / REELS / EVENT MARKETING
                  </span>
                </div>
                <div className="work-art-stamp">
                  1M+<span>CAMPAIGN & EVENT VIEWS</span>
                </div>
              </div>
              <div className="work-copy">
                <span className="section-label">
                  01 / Education & storytelling
                </span>
                <h3>Bringing a school’s stories to life.</h3>
                <p>
                  Connecting the everyday energy of Inventure Academy with its
                  digital community, from social strategy to live event
                  coverage.
                </p>
                <div className="work-tags">
                  <span>Social strategy</span>
                  <span>Video content</span>
                  <span>Events</span>
                </div>
                <details className="work-details">
                  <summary>
                    Explore the work <Plus size={18} />
                  </summary>
                  <div>
                    <p>
                      As Marketing Associate - Digital & Content, I manage
                      platform-specific storytelling across Instagram, Facebook,
                      LinkedIn, and YouTube.
                    </p>
                    <ul>
                      <li>
                        Produced 8–10 weekly reels and high-frequency content.
                      </li>
                      <li>
                        Contributed to 1M+ views across campaigns and events.
                      </li>
                      <li>
                        Led pre-event, live, and post-event content
                        amplification.
                      </li>
                    </ul>
                    <a className="text-link" href="#experience">
                      See the full role <ArrowRight size={16} />
                    </a>
                  </div>
                </details>
              </div>
            </article>
          </Reveal>
          <Reveal delay={0.12}>
            <article className="work-card">
              <div className="work-art work-art-corporate">
                <div className="work-art-meta">
                  <span>SCHNEIDER ELECTRIC</span>
                  <span>PORTFOLIO ILLUSTRATION</span>
                </div>
                <div className="corporate-poster">
                  <span className="micro-label">
                    LEADERSHIP. WITH A HUMAN VOICE.
                  </span>
                  <strong>
                    Big ideas.
                    <br />
                    <em>Wider reach.</em>
                  </strong>
                  <div className="reach-art" aria-hidden="true">
                    {[25, 42, 35, 61, 55, 75, 88, 100].map((height, i) => (
                      <span key={i} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                  <span className="art-footnote">
                    Illustrative artwork · results below
                  </span>
                </div>
                <div className="corporate-metrics">
                  <span>
                    <strong>1M+</strong>Impressions
                  </span>
                  <span>
                    <strong>4,000+</strong>Follower growth
                  </span>
                </div>
              </div>
              <div className="work-copy">
                <span className="section-label">
                  02 / Leadership & communication
                </span>
                <h3>Making global voices resonate.</h3>
                <p>
                  Building executive presence on LinkedIn and bringing global
                  teams together through purposeful content and communication.
                </p>
                <div className="work-tags">
                  <span>Executive content</span>
                  <span>LinkedIn</span>
                  <span>Communications</span>
                </div>
                <details className="work-details">
                  <summary>
                    Explore the work <Plus size={18} />
                  </summary>
                  <div>
                    <p>
                      As Marketing Specialist - Global, I connected business
                      objectives with articles, presentations, campaigns, and
                      social content.
                    </p>
                    <ul>
                      <li>
                        Achieved 1M+ impressions and 4,000+ follower growth
                        through executive LinkedIn content strategy.
                      </li>
                      <li>
                        Delivered newsletters and communication campaigns across
                        global teams.
                      </li>
                      <li>
                        Collaborated with PR teams and agencies on events,
                        launches, and communication initiatives.
                      </li>
                    </ul>
                    <a className="text-link" href="#experience">
                      See the full role <ArrowRight size={16} />
                    </a>
                  </div>
                </details>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
function Results() {
  return (
    <section id="achievements" tabIndex={-1} className="results section-space">
      <div className="container">
        <SectionTitle
          number="02"
          label="The impact"
          description="Across platforms, brands, and teams. Results from my professional journey."
        >
          Creative work.
          <br />
          <em>Concrete outcomes.</em>
        </SectionTitle>
        <div className="results-grid">
          {achievements.map((item, i) => (
            <Reveal
              className="result-cell"
              key={item.title}
              delay={(i % 3) * 0.07}
            >
              <span className="result-index">
                0{i + 1} <ArrowUpRight size={16} />
              </span>
              <div className="result-number">
                {item.number !== undefined ? (
                  <Number
                    value={item.number}
                    suffix={item.suffix}
                    decimals={item.decimals}
                  />
                ) : (
                  item.text
                )}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
function About() {
  return (
    <section id="about" tabIndex={-1} className="about section-space">
      <div className="container about-grid">
        <Reveal className="about-visual">
          <div className="about-monogram">
            <img
              src="/WhatsApp%20Image%202026-10-08%20at%2021.43.00.jpeg"
              alt="Hanan standing outdoors"
            />
            <div className="monogram-caption">
              THE PERSON
              <br />
              BEHIND THE STORIES
            </div>
            <span className="monogram-star" aria-hidden="true">
              ✦
            </span>
          </div>
          <div className="about-note">
            A curious mind.
            <br />
            <em>A strategic eye.</em>
          </div>
          <div className="about-location">
            <MapPin size={15} /> Bengaluru, Karnataka
          </div>
        </Reveal>
        <Reveal className="about-copy">
          <span className="section-label">03 / A little about me</span>
          <h2>
            Equal parts
            <br />
            strategy <em>& soul.</em>
          </h2>
          {profile.summary.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <div className="personal-details">
            <div>
              <span className="micro-label">BEYOND THE BRIEF</span>
              <p>{profile.interests.join(" · ")}</p>
            </div>
            <div>
              <span className="micro-label">LANGUAGES I SPEAK</span>
              <p>{profile.languages.join(" · ")}</p>
            </div>
          </div>
          <a href={resumeUrl} download className="text-link">
            The full story, on paper <Download size={17} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
function Experience() {
  return (
    <section id="experience" tabIndex={-1} className="experience section-space">
      <div className="container">
        <SectionTitle
          number="04"
          label="The journey"
          description="Different industries. New perspectives. One consistent thread: connecting people through content."
        >
          Built on experience.
          <br />
          <em>Driven by curiosity.</em>
        </SectionTitle>
        <div className="experience-list">
          {experience.map((job, i) => (
            <Reveal key={job.company}>
              <details className="experience-row" open={i === 0}>
                <summary>
                  <span className="job-index">0{i + 1}</span>
                  <span className="job-heading">
                    <span className="job-company">{job.company}</span>
                    <span className="job-role">{job.role}</span>
                  </span>
                  <span className="job-period">
                    {job.current && (
                      <span className="current-badge">
                        <i /> CURRENT
                      </span>
                    )}
                    <span>{job.dates}</span>
                  </span>
                  <Plus className="disclosure-icon" size={22} />
                </summary>
                <div className="job-body">
                  <span className="micro-label">{job.category}</span>
                  <ul>
                    {job.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
function Skills() {
  const groups = [
    {
      title: "Find the direction.",
      label: "STRATEGY",
      text: "Campaign planning, audience insight, and optimization that give every piece of content a purpose.",
      icon: "↗",
    },
    {
      title: "Tell the story.",
      label: "CONTENT",
      text: "Copy, video, and platform-specific storytelling that turn brand messages into human connections.",
      icon: "✳",
    },
    {
      title: "Build the connection.",
      label: "COMMUNICATION",
      text: "Communities, events, and internal communication that bring people and brands closer.",
      icon: "↔",
    },
  ];
  return (
    <section id="skills" tabIndex={-1} className="skills section-space">
      <div className="container">
        <SectionTitle
          number="05"
          label="What I bring"
          description="From the first idea to the final performance report — a connected approach to marketing."
        >
          The thinking.
          <br />
          <em>The craft. The toolkit.</em>
        </SectionTitle>
        <div className="capability-grid">
          {groups.map((group, i) => (
            <Reveal className="capability" key={group.label} delay={i * 0.08}>
              <span className="capability-icon" aria-hidden="true">
                {group.icon === "✳" ? <MoveUpRight size={36} /> : group.icon}
              </span>
              <span className="micro-label">
                0{i + 1} / {group.label}
              </span>
              <h3>{group.title}</h3>
              <p>{group.text}</p>
            </Reveal>
          ))}
        </div>
        <div className="expertise-bottom">
          <Reveal>
            <h3 className="small-heading">The skills behind the work</h3>
            <div className="skill-tags">
              {skills.map((skill) => (
                <span className="tag-skill" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <h3 className="small-heading">Tools of the trade</h3>
            <div className="tool-list">
              {tools.map((tool) => (
                <span className="tool-item" key={tool}>
                  <ToolLogo tool={tool} />
                  <span className="tool-name">{tool}</span>
                  <ArrowUpRight size={12} />
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter at least 2 characters.")
    .max(100, "Please keep your name under 100 characters."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(254),
  subject: z
    .string()
    .trim()
    .min(3, "Please enter a subject of at least 3 characters.")
    .max(200),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters.")
    .max(3000, "Please keep your message under 3,000 characters."),
});
type ContactValues = z.infer<typeof contactSchema>;
function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });
  const [draft, setDraft] = useState<string | null>(null);
  const onSubmit = (values: ContactValues) => {
    const body = `Hello Hanan,\n\n${values.message}\n\nFrom: ${values.name}\nEmail: ${values.email}`;
    const url = `mailto:${profile.email}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`;
    setDraft(url);
    window.open(url, "_blank", "noopener,noreferrer");
  };
  return (
    <section
      id="contact"
      tabIndex={-1}
      className="section-dark contact section-space"
    >
      <div className="container contact-grid">
        <Reveal>
          <span className="section-label">06 / Your next chapter</span>
          <h2 className="text-editorial">
            Let’s create
            <br />
            <em>something meaningful.</em>
          </h2>
          <p className="contact-intro">
            A brand story to tell? A community to grow? I’d love to hear what
            you have in mind.
          </p>
          <div className="contact-links">
            <a href={`mailto:${profile.email}`}>
              <Mail />
              <div>
                <span>EMAIL</span>
                <strong>{profile.email}</strong>
              </div>
              <ArrowUpRight className="contact-arrow" />
            </a>
            <a href="tel:+919797085472">
              <Phone />
              <div>
                <span>PHONE</span>
                <strong>{profile.phone}</strong>
              </div>
              <ArrowUpRight className="contact-arrow" />
            </a>
            <div>
              <MapPin />
              <div>
                <span>BASED IN</span>
                <strong>{profile.location}</strong>
              </div>
            </div>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin />
              <div>
                <span>LINKEDIN</span>
                <strong>Peerzada Abdul Hanan</strong>
              </div>
              <ArrowUpRight className="contact-arrow" />
            </a>
          </div>
        </Reveal>
        <Reveal className="contact-form-wrap" delay={0.15}>
          <div className="form-heading">
            <h3>Start a conversation.</h3>
            <Send size={21} />
          </div>
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid">
              {(["name", "email", "subject"] as const).map((field) => (
                <div
                  className={field === "subject" ? "full-field" : ""}
                  key={field}
                >
                  <label htmlFor={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    id={field}
                    type={field === "email" ? "email" : "text"}
                    autoComplete={
                      field === "name"
                        ? "name"
                        : field === "email"
                          ? "email"
                          : "off"
                    }
                    {...register(field)}
                    aria-invalid={!!errors[field]}
                    aria-describedby={
                      errors[field] ? `${field}-error` : undefined
                    }
                  />
                  {errors[field] && (
                    <p className="field-error" id={`${field}-error`}>
                      {errors[field]?.message}
                    </p>
                  )}
                </div>
              ))}
              <div className="full-field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  {...register("message")}
                  aria-invalid={!!errors.message}
                  aria-describedby={
                    errors.message ? "message-error" : undefined
                  }
                />
                {errors.message && (
                  <p className="field-error" id="message-error">
                    {errors.message.message}
                  </p>
                )}
              </div>
            </div>
            <button type="submit" className="btn-gold form-submit">
              Send Message <ArrowRight size={19} />
            </button>
            <p className="form-note">
              Opens a prefilled draft in your email app. You review and send.
            </p>
            {draft && (
              <div className="form-status" role="status">
                <Check size={18} />
                <span>
                  Your email draft is ready. If your email app didn’t open,{" "}
                  <a href={draft}>open the draft</a> or email{" "}
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>{" "}
                  directly.
                </span>
              </div>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#home" className="brand">
              hanan<span>✦</span>
            </a>
            <p>
              Peerzada Abdul Hanan
              <br />
              Strategy led. Story driven. Always human.
            </p>
            <div className="social-links">
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Hanan on LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a href={`mailto:${profile.email}`} aria-label="Email Hanan">
                <Mail size={18} />
              </a>
              <a href={resumeUrl} download aria-label="Download Hanan’s resume">
                <Download size={18} />
              </a>
            </div>
          </div>
          <div className="footer-education">
            <span className="section-label">The foundation</span>
            {education.map((item) => (
              <div className="education-item" key={item.degree}>
                <h3>{item.degree}</h3>
                <p>
                  {item.school} · {item.dates}
                </p>
                <p>Majors: {item.major}</p>
              </div>
            ))}
          </div>
          <div className="footer-certifications">
            <span className="section-label">Always learning</span>
            <div className="certifications">
              {certifications.map((cert) => (
                <div key={cert}>
                  <Check size={13} />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Peerzada Abdul Hanan</span>
          <span>
            Made with intention. <span>✦</span>
          </span>
          <a href="#home">
            Back to top <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content">
        <Hero />
        <BrandStrip />
        <Work />
        <Results />
        <About />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  );
}
