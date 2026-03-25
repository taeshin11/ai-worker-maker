export type Dict = {
  brand: string;
  nav: {
    company: string;
    workspace: string;
    vision: string;
  };
  header: {
    signOut: string;
  };
  apiKey: {
    addKey: string;
    connected: string;
    modalTitle: string;
    modalSubtitle: string;
    howTo: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    openConsole: string;
    privacy: string;
    connect: string;
    disconnect: string;
    cancel: string;
  };
  dashboard: {
    pageTitle: string;
    newDept: string;
    noDepts: string;
    noDeptsDesc: string;
    createDept: string;
    deptFormTitle: string;
    deptFormDesc: string;
    deptNameLabel: string;
    deptNamePlaceholder: string;
    createDeptBtn: string;
    cancel: string;
    noAgents: string;
    hireEmployee: string;
    newEmployee: string;
    nameLabel: string;
    roleLabel: string;
    hire: string;
    chat: string;
    stats: (d: number, a: number) => string;
    employees: (n: number) => string;
    chatWith: (name: string) => string;
    rolePlaceholder: (dept: string) => string;
  };
  workspace: {
    agents: string;
    chooseAgent: string;
    noAgentTitle: string;
    tapMenuPrefix: string;
    tapMenuLabel: string;
    tapMenuSuffix: string;
    tapToChoose: string;
    readyToHelp: string;
    apiKeyBanner: string;
    thinking: string;
    enterToSend: string;
    placeholderNoAgent: string;
    placeholderNoKey: string;
    messagePlaceholder: (name: string) => string;
  };
  onboard: {
    pageTitle: string;
    pageDesc: string;
    chatTitle: string;
    charterTitle: string;
    chatTab: string;
    charterTab: string;
    placeholder: string;
    send: string;
    thinking: string;
    approveTeam: string;
    rejectTeam: string;
    approving: string;
    teamApproved: string;
    emptyCharter: string;
    sectionProblem: string;
    sectionSolution: string;
    sectionAudience: string;
    sectionFeatures: string;
    sectionTone: string;
    proposedTeam: string;
    rationale: string;
    firstTasks: string;
    phaseExploring: string;
    phaseRefining: string;
    phaseProposing: string;
    phaseApproved: string;
  };
  errors: {
    overloaded: string;
    rate_limit: string;
    invalid_key: string;
    no_key: string;
    api_error: string;
    unknown: string;
    retry: string;
  };
  auth: {
    welcome: string;
    signInTo: string;
    email: string;
    password: string;
    signIn: string;
    signingIn: string;
    demoAccount: string;
    noAccount: string;
    signUp: string;
    createAccount: string;
    joinUs: string;
    fullName: string;
    alreadyHave: string;
    creatingAccount: string;
  };
};

export const en: Dict = {
  brand: "AI Worker Maker",

  nav: {
    company: "Company",
    workspace: "Workspace",
    vision: "Vision",
  },

  header: {
    signOut: "Sign out",
  },

  apiKey: {
    addKey: "Add API Key",
    connected: "Connected",
    modalTitle: "Connect to Claude AI",
    modalSubtitle: "Your agents need this to come to life",
    howTo: "How to get your free API key:",
    step1Title: "Go to Anthropic",
    step1Desc:
      "Click the button below to visit console.anthropic.com. Sign in or create a free account.",
    step2Title: "Create an API Key",
    step2Desc: 'Click "API Keys" in the left menu, then click "Create Key".',
    step3Title: "Copy & paste here",
    step3Desc:
      'Give the key any name, click "Create", then copy and paste it below.',
    openConsole: "Step 1: Open Anthropic site",
    privacy:
      "Your key is stored only in your browser and is never sent to our servers. It goes directly to Anthropic.",
    connect: "Connect",
    disconnect: "Disconnect",
    cancel: "Cancel",
  },

  dashboard: {
    pageTitle: "Your Company",
    newDept: "New Department",
    noDepts: "No departments yet",
    noDeptsDesc: "Create your first department to start hiring AI employees.",
    createDept: "Create a Department",
    deptFormTitle: "New Department",
    deptFormDesc: "Add a new workspace to your company.",
    deptNameLabel: "Department name",
    deptNamePlaceholder: "e.g. Finance, Legal, Design…",
    createDeptBtn: "Create Department",
    cancel: "Cancel",
    noAgents: "No agents yet.",
    hireEmployee: "Hire AI Employee",
    newEmployee: "New AI Employee",
    nameLabel: "Name",
    roleLabel: "Role description",
    hire: "Hire",
    chat: "Chat",
    stats: (d, a) =>
      `${d} department${d !== 1 ? "s" : ""} · ${a} AI employee${a !== 1 ? "s" : ""}`,
    employees: (n) => (n === 1 ? "1 employee" : `${n} employees`),
    chatWith: (name) => `Chat with ${name}`,
    rolePlaceholder: (dept) =>
      `You are a specialist in ${dept.toLowerCase()}. You help with…`,
  },

  workspace: {
    agents: "Agents",
    chooseAgent: "Choose an Agent",
    noAgentTitle: "No agent selected",
    tapMenuPrefix: "Tap the",
    tapMenuLabel: "menu",
    tapMenuSuffix: "to choose an agent.",
    tapToChoose: "Tap ☰ to choose an agent",
    readyToHelp: "Ready to help",
    apiKeyBanner:
      "Add your Anthropic API key to start chatting. Click here to set it up.",
    thinking: "is thinking…",
    enterToSend: "Enter to send · Shift+Enter for new line",
    placeholderNoAgent: "Choose an agent first…",
    placeholderNoKey: "Add your API key to chat…",
    messagePlaceholder: (name) => `Message ${name}…`,
  },

  onboard: {
    pageTitle: "Company Vision",
    pageDesc: "Chat with your Chief PM to define your company's vision and team.",
    chatTitle: "Chief PM",
    charterTitle: "Live Charter",
    chatTab: "Chat",
    charterTab: "Charter",
    placeholder: "Tell me about your idea…",
    send: "Send",
    thinking: "Chief PM is thinking…",
    approveTeam: "Approve Team & Build Company",
    rejectTeam: "Revise Team",
    approving: "Building your company…",
    teamApproved: "Team created! Redirecting…",
    emptyCharter: "Your charter will appear here as you chat with the Chief PM.",
    sectionProblem: "Problem",
    sectionSolution: "Solution",
    sectionAudience: "Target Audience",
    sectionFeatures: "Key Features",
    sectionTone: "Tone",
    proposedTeam: "Proposed Team",
    rationale: "Rationale",
    firstTasks: "First Tasks",
    phaseExploring: "Exploring",
    phaseRefining: "Refining",
    phaseProposing: "Proposing",
    phaseApproved: "Approved",
  },

  auth: {
    welcome: "Welcome back",
    signInTo: "Sign in to AI Worker Maker",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    demoAccount: "Demo Account",
    noAccount: "No account?",
    signUp: "Sign up",
    createAccount: "Create an account",
    joinUs: "Join AI Worker Maker",
    fullName: "Full name",
    alreadyHave: "Already have an account?",
    creatingAccount: "Creating account…",
  },

  errors: {
    overloaded: "The AI server is currently busy. Please try again in a moment.",
    rate_limit: "Too many requests. Please wait a moment and try again.",
    invalid_key: "Your API key is invalid or expired. Please check your key in the connection settings.",
    no_key: "No API key found. Please add your Anthropic API key first.",
    api_error: "Something went wrong with the AI service. Please try again.",
    unknown: "An unexpected error occurred. Please try again.",
    retry: "Retry",
  },
};
