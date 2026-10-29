export const aboutPage = {
  title: "We build the systems that run your business.",
  intro:
    "Optimal Core OS is a software studio for business owners. We design and build the internal systems, websites and mobile-ready applications that a business runs on, shaped around the way that business actually works.",
  mission:
    "Our mission is simple: give business owners software they can understand, operate and own. That means plain-English scope, timelines written down before work starts, working software shown early, and a clean handover at the end.",
  principles: [
    {
      title: "Clarity",
      body: "If a sentence needs a glossary, we rewrite the sentence. Scope, timeline and price are stated plainly before work begins.",
    },
    {
      title: "Reliability",
      body: "Delivered dates are commitments, not estimates. Progress is shown weekly, in working software, not in status reports.",
    },
    {
      title: "Ownership",
      body: "You own the system and the data in it. Ownership terms are written into your agreement, not implied.",
    },
    {
      title: "Craft",
      body: "Quiet, careful engineering: fast pages, clear screens, sensible data and code that another engineer can pick up.",
    },
  ],
  /**
   * §7.6: no invented name, photo or biography. Until the owner supplies the real
   * details this paragraph is deliberately about the team, not a fictional person.
   */
  leadership: {
    heading: "Leadership",
    body: "Optimal Core OS is led by its founding engineers, who scope every project personally and stay on it through delivery. Leadership profiles are published when the people themselves supply them — this site will not describe a team member who does not exist.",
  },
  whereWeWork: {
    heading: "Where we work",
    body: "Based in the Philippines. Working with business owners worldwide.",
    detail:
      "Meetings default to Asia/Manila business hours, and you can pick any timezone when you request one. We will confirm a time that works for you.",
  },
  approach: {
    heading: "How we think about software",
    body: "A system earns its keep when it removes work, not when it adds features. So we start with the repeated task, the missing number or the file only one person understands — then build the smallest system that fixes it properly.",
  },
} as const;
