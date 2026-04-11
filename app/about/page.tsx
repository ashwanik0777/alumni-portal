import { Award, Compass, Globe2, HeartHandshake, School, Sparkles, Target, Users } from "lucide-react";

const committeeMembers = [
    { role: "President", name: "Sh. Avneendra Rathaur", batch: "1994" },
    { role: "Vice President", name: "Sh. Susheel Mathur", batch: "2000" },
    { role: "Secretary", name: "Sh. Pawan Yadav", batch: "2010" },
    { role: "Joint Secretary (Alumni Relation)", name: "Sh. Ashwani Dixit", batch: "2011" },
    { role: "Joint Secretary (Student Relations)", name: "Sh. Subhash Chandra", batch: "1999" },
    { role: "Joint Secretary (Industry)", name: "Sh. Sirmit Katiyar", batch: "1998" },
    { role: "Treasurer", name: "Sh. Pramod Pal", batch: "2009" },
];

const values = [
    {
        icon: Users,
        title: "Community First",
        text: "We build long-term relationships among alumni, students, and mentors through meaningful engagement.",
    },
    {
        icon: Target,
        title: "Purpose Driven",
        text: "Our platform is designed for mentorship, opportunities, leadership, and measurable social impact.",
    },
    {
        icon: Compass,
        title: "Future Focused",
        text: "We help members navigate career transitions, entrepreneurship, and collaborative growth.",
    },
    {
        icon: HeartHandshake,
        title: "Give Back Culture",
        text: "Every contribution, from advice to action, strengthens the foundation for future generations.",
    },
];

const milestones = [
    { label: "Global Alumni Reach", value: "30+ Cities" },
    { label: "Mentorship & Career Sessions", value: "1,300+" },
    { label: "Community Participation", value: "4,000+ Alumni" },
];

export default function AboutPage() {
    return (
        <div className="bg-background min-h-screen text-text-primary">
            <section className="relative overflow-hidden border-b border-border">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-14 -left-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute top-8 right-0 h-96 w-96 rounded-full bg-secondary/15 blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
                    <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-5">
                        <Sparkles className="h-4 w-4" />
                        About The Alumni Community
                    </p>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl">
                        The Heart Of JNV Farrukhabad Beyond Campus Years
                    </h1>
                    <p className="mt-5 text-lg md:text-xl text-text-secondary max-w-3xl leading-relaxed">
                        We are a living network of alumni who learn together, support one another, and create long-term
                        value for students, families, and society through action.
                    </p>

                    <div className="mt-8 grid sm:grid-cols-3 gap-3 max-w-3xl">
                        {milestones.map((item) => (
                            <div key={item.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                                <p className="text-2xl font-black text-primary">{item.value}</p>
                                <p className="text-xs text-text-secondary mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {values.map((item) => (
                        <article key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-bold">{item.title}</h2>
                            <p className="text-sm text-text-secondary mt-2 leading-relaxed">{item.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="border-y border-border bg-card/70">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 grid lg:grid-cols-12 gap-8 lg:gap-10">
                    <div className="lg:col-span-5 rounded-2xl border border-border bg-background p-6 sm:p-8 shadow-sm">
                        <p className="inline-flex items-center gap-2 rounded-full bg-secondary/20 text-text-primary text-xs font-semibold px-3 py-1 mb-4">
                            <School className="h-4 w-4 text-primary" />
                            Our Story
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-bold">A Shared Legacy, Continuously Renewed</h2>
                        <p className="mt-4 text-text-secondary leading-relaxed">
                            The alumni body of JNV Farrukhabad is built on trust, academic spirit, and collective
                            responsibility. What started as reconnecting old classmates has evolved into a platform for
                            mentorship, leadership, collaboration, and institution-building.
                        </p>
                        <p className="mt-4 text-text-secondary leading-relaxed">
                            Our community focuses on real outcomes: guiding students, supporting careers, enabling
                            entrepreneurship, and preserving the values that shaped us.
                        </p>
                        <div className="mt-6 rounded-xl border border-border bg-card p-4">
                            <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                                <Globe2 className="h-4 w-4" />
                                Connected across regions, united by one identity.
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-7 rounded-2xl border border-border bg-background p-6 sm:p-8 shadow-sm">
                        <div className="text-center mb-8">
                            <p className="text-sm font-semibold text-primary uppercase tracking-wide">Leadership</p>
                            <h3 className="text-2xl sm:text-3xl font-bold mt-2">Executive Committee</h3>
                            <p className="text-text-secondary mt-2">
                                A committed team guiding alumni initiatives, chapter operations, and strategic growth.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {committeeMembers.map((member, index) => (
                                <article
                                    key={member.name}
                                    className={`rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all ${
                                        index === committeeMembers.length - 1 && committeeMembers.length % 2 !== 0
                                            ? "md:col-span-2 md:w-2/3 md:mx-auto"
                                            : ""
                                    }`}
                                >
                                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary mb-2">{member.role}</p>
                                    <p className="text-lg font-bold">{member.name}</p>
                                    <p className="text-sm text-text-secondary mt-1">Batch of {member.batch}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
                <div className="rounded-3xl border border-primary/20 dark:border-primary/40 bg-linear-to-r from-primary/95 to-primary dark:from-slate-900 dark:to-blue-950 p-8 sm:p-10 text-white relative overflow-hidden">
                    <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/10" />
                    <div className="absolute -left-12 -bottom-16 h-52 w-52 rounded-full bg-secondary/20" />
                    <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <p className="inline-flex items-center gap-2 text-sm font-medium bg-white/10 px-3 py-1 rounded-full mb-3">
                                <Award className="h-4 w-4" />
                                Legacy In Motion
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-bold">Become an active part of this story.</h3>
                            <p className="mt-2 text-white/90 max-w-2xl">
                                Join the alumni platform to mentor, collaborate, and contribute to the next generation.
                            </p>
                        </div>
                        <a
                            href="/register"
                            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 font-semibold text-primary hover:bg-white/90 transition-colors"
                        >
                            Join The Network
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
