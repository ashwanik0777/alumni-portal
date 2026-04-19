export type AlumniProfile = {
  slug: string;
  name: string;
  batch: string;
  role: string;
  company: string;
  location: string;
  expertise: string;
  about: string;
  contribution: string;
  achievements: string[];
  mentorshipAreas: string[];
  contactPolicy: string;
};

export const alumniProfiles: AlumniProfile[] = [
  {
    slug: "aditi-verma",
    name: "Aditi Verma",
    batch: "2015",
    role: "Senior Software Engineer",
    company: "Microsoft",
    location: "Bengaluru",
    expertise: "Backend, Cloud Architecture",
    about:
      "Aditi works on distributed backend systems and helps teams design scalable cloud services.",
    contribution:
      "Supports coding interview preparation circles and mentors final-year students in backend fundamentals.",
    achievements: [
      "Led migration of critical services to cloud-native architecture",
      "Mentored 40+ early career engineers",
      "Speaker at two national developer conferences",
    ],
    mentorshipAreas: ["Backend Development", "System Design", "Cloud Engineering"],
    contactPolicy: "Public profile shows professional details only. Direct contact is shared after mutual consent.",
  },
  {
    slug: "rohit-mishra",
    name: "Rohit Mishra",
    batch: "2012",
    role: "Product Manager",
    company: "Flipkart",
    location: "Mumbai",
    expertise: "Product Strategy, Growth",
    about:
      "Rohit leads product strategy for growth initiatives and data-driven user experience improvements.",
    contribution:
      "Conducts monthly product case workshops for alumni and students interested in PM roles.",
    achievements: [
      "Launched 3 high-impact product initiatives",
      "Built cross-functional product playbook",
      "Guest mentor for startup incubation cohorts",
    ],
    mentorshipAreas: ["Product Management", "Career Transition", "Growth Strategy"],
    contactPolicy: "Public profile includes role and mentorship focus. Personal contact is private.",
  },
  {
    slug: "sneha-dubey",
    name: "Sneha Dubey",
    batch: "2018",
    role: "Data Scientist",
    company: "Amazon",
    location: "Hyderabad",
    expertise: "ML, Analytics",
    about:
      "Sneha works on machine learning models for recommendation and business analytics pipelines.",
    contribution:
      "Helps scholarship applicants with data-science career planning and project reviews.",
    achievements: [
      "Published internal ML optimization framework",
      "Improved model performance for production workflows",
      "Mentored junior analysts in practical ML",
    ],
    mentorshipAreas: ["Machine Learning", "Analytics", "Data Career Guidance"],
    contactPolicy: "Only approved professional profile information is public.",
  },
  {
    slug: "anurag-singh",
    name: "Anurag Singh",
    batch: "2010",
    role: "Founder",
    company: "EdTech Venture",
    location: "Delhi NCR",
    expertise: "Startups, Fundraising",
    about:
      "Anurag is building an education startup focused on access and outcomes for underserved learners.",
    contribution:
      "Supports entrepreneurship mentorship and helps early-stage founders validate ideas.",
    achievements: [
      "Raised seed funding for education startup",
      "Built partnerships across school networks",
      "Mentored student startup teams",
    ],
    mentorshipAreas: ["Entrepreneurship", "Fundraising", "Leadership"],
    contactPolicy: "Public page is limited to approved professional and community details.",
  },
  {
    slug: "nidhi-chauhan",
    name: "Nidhi Chauhan",
    batch: "2016",
    role: "UX Designer",
    company: "Adobe",
    location: "Pune",
    expertise: "Design Systems, Research",
    about:
      "Nidhi designs user-first digital products and contributes to enterprise design systems.",
    contribution:
      "Runs portfolio feedback sessions for students and design enthusiasts in the alumni network.",
    achievements: [
      "Created scalable design system components",
      "Improved usability scores in major product areas",
      "Panel mentor for design career events",
    ],
    mentorshipAreas: ["UX Design", "Portfolio Review", "Design Research"],
    contactPolicy: "Only consented public information is displayed.",
  },
  {
    slug: "kunal-saxena",
    name: "Kunal Saxena",
    batch: "2014",
    role: "DevOps Lead",
    company: "Infosys",
    location: "Noida",
    expertise: "Kubernetes, Platform Engineering",
    about:
      "Kunal leads platform reliability and deployment automation initiatives for large engineering teams.",
    contribution:
      "Guides learners on DevOps roadmaps and infrastructure fundamentals.",
    achievements: [
      "Designed CI/CD standards across multiple projects",
      "Reduced deployment incidents through reliability practices",
      "Facilitated DevOps bootcamps for juniors",
    ],
    mentorshipAreas: ["DevOps", "Infrastructure", "Cloud Operations"],
    contactPolicy: "Public profile is restricted to approved professional data.",
  },
];
