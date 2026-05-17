import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Code2,
  ExternalLink,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Trophy,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { siteConfig } from "@/components/seo/SiteConfig";

const developer = {
  name: "Abdur Rahman",
  title: "Front-End Engineer",
  email: "abdurrahman19011@gmail.com",
  phone: "+880 1722341973",
  location: "Dhaka, Bangladesh",
  portfolio: "https://my-portfolio-lovat-zeta-22.vercel.app/",
  linkedin: "https://www.linkedin.com/in/abdur-rahman-cse2024/",
};

export const metadata: Metadata = {
  title: "About the Developer",
  description: `${developer.name}, Front-End Engineer based in Dhaka. The developer behind PDF Studio.`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About ${developer.name}`,
    description: `Front-End Engineer based in ${developer.location}. The developer behind ${siteConfig.name}.`,
    url: `${siteConfig.url}/about`,
    images: [
      {
        url: `/og?title=${encodeURIComponent(developer.name)}&subtitle=${encodeURIComponent(developer.title + ", " + developer.location)}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

const skills = [
  {
    label: "Programming Languages",
    items: ["C", "C++", "JavaScript", "TypeScript"],
  },
  {
    label: "Frontend",
    items: [
      "React.js",
      "Next.js",
      "Angular.js",
      "JavaScript",
      "TypeScript",
      "Tailwind CSS",
      "HTML",
      "CSS",
    ],
  },
  {
    label: "Familiar with",
    items: [
      "Shadcn/ui",
      "Material-UI",
      "Node.js",
      "Express.js",
      "MongoDB",
      "MySQL",
      "REST API",
    ],
  },
  {
    label: "Tools",
    items: [
      "Git",
      "Redux",
      "Zustand",
      "Axios",
      "Vercel",
      "Netlify",
      "Jira",
      "Chrome DevTools",
    ],
  },
  {
    label: "Soft Skills",
    items: ["Problem-solving", "Debugging", "Respecting different opinions"],
  },
];

const experience = [
  {
    role: "Graduate Software Engineer",
    company: "Kona Software Lab Limited",
    location: "Gulshan-2, Dhaka",
    period: "May 2026, Present",
    bullets: [
      "Implemented product listing, filtering, and cart system with REST API integration.",
      "Collaborated with backend engineers to integrate APIs and ship pixel-perfect designs.",
    ],
  },
  {
    role: "Front-End Developer Intern",
    company: "Kona Software Lab Limited",
    location: "Gulshan-2, Dhaka",
    period: "Sep 2024, Dec 2024",
    bullets: [
      "Hands-on experience in HTML, CSS, Tailwind CSS, JavaScript, and React.js.",
      "Developed and improved UI components for production web applications.",
      "Worked with the team to implement responsive designs.",
    ],
  },
];

const education = [
  {
    degree: "Master of Computer Science and Engineering (MCSE)",
    school: "National University, Bangladesh",
    period: "2026, Present",
  },
  {
    degree: "Bachelor of Science in Computer Science (CSE)",
    school: "Institute of Science and Technology, National University",
    period: "2018, 2022",
  },
];

const projects = [
  {
    name: "E-Commerce Website",
    bullets: [
      "Responsive e-commerce UI with listing, filtering, and cart using React and Tailwind.",
      "Axios for efficient API communication and dynamic product data updates.",
    ],
  },
  {
    name: "FIDO Passkeys",
    bullets: [
      "Passwordless authentication system using WebAuthn, Next.js 16, and React 19.",
      "Secure Node.js/Express backend with TypeScript for server-side verification.",
    ],
  },
];

const activities = [
  "Solved 100+ problems across various online judges.",
  "Participated in ICPC programming contests and virtual judge contests.",
  "Analyses modern UI/UX design trends to ship pixel-perfect, user-centric interfaces.",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to PDF Studio
      </Link>

      {/* Hero */}
      <section className="flex flex-wrap items-center gap-5 sm:gap-6">
        <div
          className="grid h-20 w-20 sm:h-24 sm:w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg"
          aria-hidden="true"
        >
          <span className="text-3xl sm:text-4xl font-black tracking-tight">
            AR
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            About the developer
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            {developer.name}
          </h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            {developer.title}
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {developer.location}
          </p>
        </div>
      </section>

      {/* Contact buttons */}
      <section className="grid gap-2 sm:grid-cols-2">
        <a
          href={developer.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary/40 hover:shadow-sm"
        >
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <ExternalLink className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Portfolio</p>
            <p className="truncate text-xs text-muted-foreground">
              my-portfolio-lovat-zeta-22.vercel.app
            </p>
          </div>
        </a>
        <a
          href={developer.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary/40 hover:shadow-sm"
        >
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-500/10 text-blue-500">
            <Linkedin className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">LinkedIn</p>
            <p className="truncate text-xs text-muted-foreground">
              linkedin.com/in/abdur-rahman-cse2024
            </p>
          </div>
        </a>
        <a
          href={`mailto:${developer.email}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary/40 hover:shadow-sm"
        >
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-rose-500/10 text-rose-500">
            <Mail className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Email</p>
            <p className="truncate text-xs text-muted-foreground">
              {developer.email}
            </p>
          </div>
        </a>
        <a
          href={`tel:${developer.phone.replace(/\s+/g, "")}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary/40 hover:shadow-sm"
        >
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <Phone className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Phone</p>
            <p className="truncate text-xs text-muted-foreground">
              {developer.phone}
            </p>
          </div>
        </a>
      </section>

      {/* Education */}
      <Section icon={GraduationCap} title="Education">
        <ul className="space-y-3">
          {education.map((e) => (
            <li key={e.degree} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="font-medium">{e.degree}</p>
              <span className="text-xs text-muted-foreground tabular-nums">
                {e.period}
              </span>
              <p className="w-full text-sm text-muted-foreground">{e.school}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Skills */}
      <Section icon={Code2} title="Skills">
        <dl className="space-y-3">
          {skills.map((s) => (
            <div key={s.label}>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {s.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs"
                  >
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Experience */}
      <Section icon={Briefcase} title="Experience">
        <ol className="space-y-5">
          {experience.map((job) => (
            <li
              key={job.role + job.period}
              className="border-l-2 border-border pl-4"
            >
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <p className="font-medium">{job.role}</p>
                <span className="text-xs text-muted-foreground tabular-nums">
                  · {job.period}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {job.company}, {job.location}
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {job.bullets.map((b) => (
                  <li key={b} className="text-muted-foreground">
                    {b}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      {/* Projects */}
      <Section icon={Sparkles} title="Projects">
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.name}>
              <CardContent className="space-y-2">
                <p className="font-medium">{p.name}</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {p.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Extracurricular */}
      <Section icon={Trophy} title="Extracurricular">
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {activities.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Section>

      <section className="rounded-2xl border border-border bg-gradient-to-br from-indigo-50/60 via-card to-fuchsia-50/40 dark:from-indigo-950/30 dark:to-fuchsia-950/20 p-6 sm:p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Want to collaborate or have feedback on{" "}
          <Link href="/" className="text-primary hover:underline">
            PDF Studio
          </Link>
          ?
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm">
          <a
            href={`mailto:${developer.email}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-primary-foreground hover:opacity-90"
          >
            <Mail className="h-3.5 w-3.5" />
            Email me
          </a>
          <a
            href={developer.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 hover:border-primary/40"
          >
            <Linkedin className="h-3.5 w-3.5" />
            Connect on LinkedIn
          </a>
          <a
            href={developer.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 hover:border-primary/40"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Portfolio
          </a>
        </div>
      </section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}
