export type ProcessStep = {
  number: number;
  title: string;
  weDo: string;
  youDo: string;
  duration: string;
};

export const processSteps: ProcessStep[] = [
  {
    number: 1,
    title: "Discovery meeting",
    weDo: "We listen, and ask how your process works today, where it slows down and what a good result looks like.",
    youDo: "Describe the problem, the goals and who is affected.",
    duration: "Free · 30–45 minutes · virtual",
  },
  {
    number: 2,
    title: "Scope & quotation",
    weDo: "We write the scope, the timeline and the quotation, in plain English.",
    youDo: "Review it, ask questions, approve it in writing.",
    duration: "Within a few business days",
  },
  {
    number: 3,
    title: "Design",
    weDo: "We design the screens and let you click through them before anything is built.",
    youDo: "Give feedback on what you see.",
    duration: "First days of the build",
  },
  {
    number: 4,
    title: "Build",
    weDo: "We develop in short cycles and show you working software, with a progress update every week.",
    youDo: "Test what is ready and respond with what to change.",
    duration: "Weekly progress updates",
  },
  {
    number: 5,
    title: "Launch",
    weDo: "We deploy the system, migrate your data and train your team on the screens they will use.",
    youDo: "Sign off on the finished system.",
    duration: "Go-live week",
  },
  {
    number: 6,
    title: "Support",
    weDo: "We fix what post-launch use reveals and handle agreed improvements.",
    youDo: "Report issues as you find them.",
    duration: "Support period defined in your quotation",
  },
];

export const smallSystemFits = [
  "One business, one team",
  "Up to a few hundred users",
  "A focused set of screens",
  "Data imported from spreadsheets",
  "One launch, then support",
];

export const largeSystemPhases = [
  "Foundation: roles, data model, environments",
  "Core modules, released as they are finished",
  "Scale and security review",
  "Launch, training and handover",
];

export const pricing = {
  heading: "How pricing works",
  body:
    "Every business is different, so we don't publish one-size-fits-all prices. Tell us what you want to solve and we'll prepare a clear quotation. Start by booking a free virtual meeting.",
} as const;

export const processPage = {
  title: "A process you can follow.",
  subtitle: "You always know what happens next, what we need from you, and when it's due.",
  visualAlt: "Vertical timeline with six numbered circles connected by a line, with a highlighted current step.",
} as const;
