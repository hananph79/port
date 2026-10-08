import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, MotionConfig, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, ArrowDown, Download, Menu, X, Mail, Phone, MapPin, Linkedin, Sparkles, Eye, TrendingUp, Users, Video, Network, Layers, Check, ChevronUp, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { profile, skills, tools, experience, achievements, education, certifications } from './content';

const cn = (...values: Parameters<typeof clsx>) => twMerge(clsx(values));
const links = [{ name: 'About', id: 'about' }, { name: 'Experience', id: 'experience' }, { name: 'Skills', id: 'skills' }, { name: 'Contact', id: 'contact' }];
const resumeUrl = '/peerzada-abdul-hanan-resume.pdf';

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }} transition={{ duration: .5, ease: 'easeOut', delay }}>{children}</motion.div>;
}

function Number({ value, suffix = '', decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: .2 });
  const reduced = useReducedMotion();
  return <span ref={ref} aria-label={`${value.toLocaleString()}${suffix}`}><span aria-hidden="true">{reduced ? `${value.toLocaleString(undefined, { minimumFractionDigits: decimals })}${suffix}` : <CountUp start={0} end={inView ? value : 0} decimals={decimals} suffix={suffix} separator="," duration={1.6} />}</span></span>;
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20);
    update(); window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    menuPanel.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus(); }
      if (event.key === 'Tab') {
        const focusable = [menuButton.current, ...Array.from(menuPanel.current?.querySelectorAll<HTMLAnchorElement>('a') ?? [])].filter(Boolean) as HTMLElement[];
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    const onResize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener('keydown', onKey); window.addEventListener('resize', onResize);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); };
  }, [open]);
  return <header className={cn('site-header', scrolled && 'scrolled')}>
    <div className="container nav-inner">
      <a href="#home" className="brand" onClick={() => setOpen(false)} aria-label="Peerzada Abdul Hanan, home">Peerzada Abdul Hanan<span className="brand-dot">.</span></a>
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(link => <a key={link.id} href={`#${link.id}`}>{link.name}</a>)}</nav>
      <a className="btn-gold nav-connect" href="#contact">Let’s Connect <ArrowUpRight size={15} /></a>
      <button ref={menuButton} className="mobile-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
    {open && <div id="mobile-menu" ref={menuPanel} className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation"><span className="section-label">Explore the story</span>{links.map((link, i) => <a key={link.id} href={`#${link.id}`} onClick={() => setOpen(false)}><span>0{i + 1}</span>{link.name}<ArrowUpRight /></a>)}<a className="mobile-resume" href={resumeUrl} download><Download size={18} /> Download Resume</a></div>}
  </header>;
}

function Hero() {
  const reduced = useReducedMotion();
  return <section id="home" className="hero">
    <div className="container hero-grid">
      <div className="hero-copy">
        <Reveal><div className="opportunity"><span className="status-dot" /> Open to Opportunities <Sparkles size={13} /></div></Reveal>
        <div className="hero-eyebrow">DIGITAL MARKETING & CONTENT PROFESSIONAL</div>
        <motion.h1 className="text-editorial" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: .08 } } }}>
          {['Strategy.', 'Storytelling.', 'Real'].map(word => <motion.span className={word === 'Real' ? 'hero-inline' : 'hero-word'} key={word} variants={{ hidden: { opacity: 0, y: reduced ? 0 : 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: .5 }}>{word}{' '}</motion.span>)}
          <motion.em variants={{ hidden: { opacity: 0, y: reduced ? 0 : 20 }, visible: { opacity: 1, y: 0 } }}>impact.</motion.em>
        </motion.h1>
        <Reveal delay={.2}><p className="hero-description">I’m Hanan. I turn brand stories into meaningful connections — through strategy-led social media, content, and campaigns.</p></Reveal>
        <Reveal className="hero-actions" delay={.3}><a href="#experience" className="btn-gold">View My Work <ArrowUpRight size={19} /></a><a href={resumeUrl} className="btn-outline-gold" download>Download Resume <Download size={17} /></a></Reveal>
        <Reveal delay={.4} className="hero-stats">{[{ value: 1.5, suffix: 'M+', decimals: 1, label: 'Content views' }, { value: 1, suffix: 'M+', label: 'Impressions' }, { value: 7000, suffix: '+', label: 'Audience growth' }].map(stat => <div key={stat.label}><div className="hero-stat-value"><Number {...stat} /></div><span>{stat.label}</span></div>)}</Reveal>
      </div>
      <Reveal className="hero-art" delay={.2}>
        <div className="portrait-overline"><span>THE PERSON BEHIND THE CONTENT</span><ArrowDown size={14} /></div>
        <div className="portrait-scene"><div className="portrait-halo" /><div className="portrait-circle"><span className="initials">PH<span className="initials-dot">.</span></span><span className="portrait-caption">A CREATIVE MIND.<br />A STRATEGIC APPROACH.</span></div><div className="portrait-star" aria-hidden="true"><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6"><path d="M50 4v92M4 50h92M17 17l66 66M17 83l66-66" /></svg></div><div className="portrait-note"><span className="note-icon"><TrendingUp size={20} /></span><div><strong>Made for meaningful growth.</strong><span>Ideas with purpose. Content with impact.</span></div></div><span className="portrait-side-label">CREATIVITY × STRATEGY</span></div>
        <div className="portrait-footer"><span><MapPin size={13} /> Bengaluru, India</span><span>3+ years of storytelling</span></div>
      </Reveal>
    </div>
    <div className="container hero-bottom"><a href="#about"><span className="scroll-circle"><ArrowDown size={16} /></span> A little about me</a><span className="edition">STRATEGY LED. HUMAN FIRST.</span></div>
  </section>;
}

function About() {
  const details = [ ['Role', profile.role], ['Location', profile.location], ['Experience', '3+ years across education & global corporate environments'], ['Education', 'MBA · Marketing & Finance'], ['Languages', profile.languages.join(' · ')], ['Interests', profile.interests.join(' · ')] ];
  return <section id="about" className="section-dark about section-space"><div className="container about-grid">
    <Reveal><span className="section-label">01 / About me</span><h2 className="about-title text-editorial">Good stories connect.<br /><em>Great strategy grows.</em></h2>{profile.summary.map(paragraph => <p className="about-text" key={paragraph}>{paragraph}</p>)}<div className="features">{['Digital Marketing Strategy', 'Content Marketing & Copywriting', 'Brand Communication', 'Community & Event Marketing'].map(feature => <div key={feature}><span>✦</span>{feature}</div>)}</div></Reveal>
    <Reveal className="info-card-dark" delay={.15}><div className="info-card-heading"><span className="section-label">The details</span><Sparkles size={20} /></div>{details.map(([label, value]) => <div className="info-row" key={label}><span>{label}</span><p>{value}</p></div>)}</Reveal>
  </div></section>;
}

function Experience() {
  const reduced = useReducedMotion();
  return <section id="experience" className="section-cream section-space"><div className="container"><Reveal className="section-heading"><span className="section-label">02 / The journey</span><h2>Experience that<br /><span className="editorial-accent">shapes the story.</span></h2><p>From ambitious education brands to global conversations.</p></Reveal>
    <div className="timeline"><div className="timeline-line" />{experience.map((job, index) => <div className={cn('timeline-item', index % 2 === 1 && 'right')} key={job.company}><span className="timeline-dot" /><motion.article className="card-warm experience-card" initial={reduced ? false : { x: index % 2 === 0 ? -40 : 40, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true, amount: .1 }} transition={{ duration: .5 }}><div className="job-top"><span className="job-category">{job.category}</span>{job.current && <span className="current-badge">CURRENT</span>}</div><h3>{job.company}</h3><p className="job-role">{job.role}</p><div className="job-dates">{job.dates}</div><ul>{job.points.map(point => <li key={point}>{point}</li>)}</ul></motion.article><span className="timeline-index">0{index + 1}</span></div>)}</div>
  </div></section>;
}

const resultIcons = { views: Eye, impressions: TrendingUp, audience: Users, content: Video, team: Network, hub: Layers };
function Achievements() {
  return <section id="achievements" className="section-gold achievements section-space"><div className="container"><Reveal className="section-heading"><span className="section-label">03 / Proof in the numbers</span><h2 className="text-editorial">Results that speak.</h2><p>A few milestones. A lot of meaningful work.</p></Reveal><div className="achievement-grid">{achievements.map((result, index) => { const Icon = resultIcons[result.icon as keyof typeof resultIcons]; return <Reveal key={result.title} delay={index * .1}><motion.article initial={{ scale: .9 }} whileInView={{ scale: 1 }} viewport={{ once: true }} className="card-warm achievement-card"><div className="achievement-top"><Icon size={23} strokeWidth={1.5} /><span>0{index + 1}</span></div><div className="achievement-number">{'number' in result && result.number !== undefined ? <Number value={result.number} suffix={result.suffix} decimals={result.decimals} /> : result.text}</div><h3>{result.title}</h3><p>{result.description}</p></motion.article></Reveal>; })}</div></div></section>;
}

function Skills() {
  const reduced = useReducedMotion();
  return <section id="skills" className="section-white section-space"><div className="container skills-grid"><Reveal><span className="section-label">04 / Core skills</span><h2>Creative thinking.<br /><span className="editorial-accent">Strategic doing.</span></h2><p className="section-intro">The skills behind the stories, the campaigns, and the growth.</p><motion.div className="skill-tags" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: {}, visible: { transition: { staggerChildren: .05 } } }}>{skills.map(skill => <motion.span className="tag-skill" key={skill} variants={{ hidden: { opacity: 0, y: reduced ? 0 : 8 }, visible: { opacity: 1, y: 0 } }}>{skill}</motion.span>)}</motion.div></Reveal><Reveal delay={.15}><span className="section-label">Tools & platforms</span><h3 className="tools-heading">A well-equipped toolkit.</h3><p className="section-intro">From the first idea to the final performance report.</p><div className="tools-grid">{tools.map((tool, index) => <div className="tool-card" key={tool}><span className="tool-initial">{['M', 'G', 'C', 'Pr', 'C', 'F', 'C', 'W', 'S/H', 'O/S', 'X', 'P'][index]}</span><span>{tool}</span></div>)}</div></Reveal></div></section>;
}

const contactSchema = z.object({ name: z.string().trim().min(2, 'Please enter at least 2 characters.').max(100, 'Please keep your name under 100 characters.'), email: z.string().trim().email('Please enter a valid email address.').max(254), subject: z.string().trim().min(3, 'Please enter a subject of at least 3 characters.').max(200), message: z.string().trim().min(10, 'Please write at least 10 characters.').max(3000, 'Please keep your message under 3,000 characters.') });
type ContactValues = z.infer<typeof contactSchema>;
function Contact() {
  const { register, handleSubmit, formState: { errors } } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });
  const [draft, setDraft] = useState<string | null>(null);
  const onSubmit = (values: ContactValues) => {
    const body = `Hello Hanan,\n\n${values.message}\n\nFrom: ${values.name}\nEmail: ${values.email}`;
    const url = `mailto:${profile.email}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`;
    setDraft(url); window.open(url, '_blank', 'noopener,noreferrer');
  };
  return <section id="contact" className="section-dark contact section-space"><div className="container contact-grid"><Reveal><span className="section-label">05 / Let’s connect</span><h2 className="text-editorial">Let’s create<br /><em>something meaningful.</em></h2><p className="contact-intro">A brand story to tell? A community to grow? I’d love to hear what you have in mind.</p><div className="contact-links"><a href={`mailto:${profile.email}`}><Mail /><div><span>EMAIL</span><strong>{profile.email}</strong></div><ArrowUpRight className="contact-arrow" /></a><a href="tel:+919797085472"><Phone /><div><span>PHONE</span><strong>{profile.phone}</strong></div><ArrowUpRight className="contact-arrow" /></a><div><MapPin /><div><span>BASED IN</span><strong>{profile.location}</strong></div></div><a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin /><div><span>LINKEDIN</span><strong>Peerzada Abdul Hanan</strong></div><ArrowUpRight className="contact-arrow" /></a></div></Reveal><Reveal className="contact-form-wrap" delay={.15}><div className="form-heading"><h3>Start a conversation.</h3><Send size={21} /></div><form noValidate onSubmit={handleSubmit(onSubmit)}><div className="form-grid">{(['name', 'email', 'subject'] as const).map(field => <div className={field === 'subject' ? 'full-field' : ''} key={field}><label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</label><input id={field} type={field === 'email' ? 'email' : 'text'} autoComplete={field === 'name' ? 'name' : field === 'email' ? 'email' : 'off'} {...register(field)} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `${field}-error` : undefined} />{errors[field] && <p className="field-error" id={`${field}-error`}>{errors[field]?.message}</p>}</div>)}<div className="full-field"><label htmlFor="message">Message</label><textarea id="message" rows={5} {...register('message')} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined} />{errors.message && <p className="field-error" id="message-error">{errors.message.message}</p>}</div></div><button type="submit" className="btn-gold form-submit">Send Message <ArrowRight size={19} /></button><p className="form-note">Opens a prefilled draft in your email app. You review and send.</p>{draft && <div className="form-status" role="status"><Check size={18} /><span>Your email draft is ready. If your email app didn’t open, <a href={draft}>open the draft</a> or email <a href={`mailto:${profile.email}`}>{profile.email}</a> directly.</span></div>}</form></Reveal></div></section>;
}

function Footer() {
  return <footer className="footer"><div className="container"><div className="footer-grid"><div className="footer-brand"><a href="#home" className="text-editorial">Peerzada<br />Abdul Hanan<span>.</span></a><p>Strategy led. Story driven.<br />Always human.</p><div className="social-links"><a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Hanan on LinkedIn"><Linkedin size={18} /></a><a href={`mailto:${profile.email}`} aria-label="Email Hanan"><Mail size={18} /></a><a href={resumeUrl} download aria-label="Download Hanan’s resume"><Download size={18} /></a></div></div><div className="footer-nav"><span className="section-label">Navigate</span>{[...links.slice(0, 2), { name: 'Achievements', id: 'achievements' }, ...links.slice(2)].map(link => <a href={`#${link.id}`} key={link.id}>{link.name}<ArrowUpRight size={14} /></a>)}<a href="#home">Back to top <ChevronUp size={14} /></a></div><div className="footer-education"><span className="section-label">Education & certifications</span>{education.map(item => <div className="education-item" key={item.degree}><h3>{item.degree}</h3><p>{item.school} <span>· {item.dates}</span></p><p>Majors: {item.major}</p></div>)}<div className="certifications">{certifications.map(cert => <div key={cert}><Check size={12} /><span>{cert}</span></div>)}</div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Peerzada Abdul Hanan</span><span>Crafted for storytelling <span className="gold-star">✦</span></span></div></div></footer>;
}

export default function App() {
  return <MotionConfig reducedMotion="user"><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content"><Hero /><About /><Experience /><Achievements /><Skills /><Contact /></main><Footer /></MotionConfig>;
}
