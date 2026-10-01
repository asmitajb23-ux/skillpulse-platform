import type {
  Assessment,
  AssessmentAttempt,
  Certificate,
  CollegeProfile,
  JobRole,
  LearningResource,
  Profile,
  Project,
  RecruiterProfile,
  Skill,
  StudentProfile,
  VivaSession,
} from "@/types";

// ---------------- Demo accounts ----------------

export interface DemoAccount {
  email: string;
  password: string;
  user_id: string;
  role: Profile["role"];
  name: string;
}

export const demoAccounts: DemoAccount[] = [
  { email: "student@skillpulse.dev", password: "demo1234", user_id: "s1", role: "student", name: "Aarav Sharma" },
  { email: "recruiter@skillpulse.dev", password: "demo1234", user_id: "r1", role: "recruiter", name: "Kavya Krishnan" },
  { email: "admin@skillpulse.dev", password: "demo1234", user_id: "c1", role: "college_admin", name: "Dr. Ramesh Iyer" },
];

// ---------------- Skills ----------------

export const skills: Skill[] = [
  { id: "sk-js", name: "JavaScript", category: "Programming" },
  { id: "sk-ts", name: "TypeScript", category: "Programming" },
  { id: "sk-react", name: "React", category: "Frontend" },
  { id: "sk-node", name: "Node.js", category: "Backend" },
  { id: "sk-python", name: "Python", category: "Programming" },
  { id: "sk-sql", name: "SQL", category: "Data" },
  { id: "sk-git", name: "Git & GitHub", category: "Tools" },
  { id: "sk-ps", name: "Problem Solving", category: "Core" },
  { id: "sk-ml", name: "ML Fundamentals", category: "Data" },
  { id: "sk-comm", name: "Communication", category: "Soft Skills" },
];

// ---------------- Job roles ----------------

export const jobRoles: JobRole[] = [
  {
    id: "role-fe",
    title: "Frontend Engineer",
    description: "Build responsive, accessible user interfaces with modern JavaScript frameworks.",
    required_skills: [
      { skill_id: "sk-react", weight: 5 },
      { skill_id: "sk-js", weight: 5 },
      { skill_id: "sk-ts", weight: 4 },
      { skill_id: "sk-git", weight: 3 },
      { skill_id: "sk-comm", weight: 2 },
    ],
  },
  {
    id: "role-fs",
    title: "Full Stack Developer",
    description: "Ship end-to-end features across frontend, backend APIs and databases.",
    required_skills: [
      { skill_id: "sk-js", weight: 5 },
      { skill_id: "sk-react", weight: 4 },
      { skill_id: "sk-node", weight: 4 },
      { skill_id: "sk-sql", weight: 4 },
      { skill_id: "sk-git", weight: 3 },
      { skill_id: "sk-ps", weight: 3 },
    ],
  },
  {
    id: "role-be",
    title: "Backend Engineer",
    description: "Design reliable APIs, data models and server-side systems.",
    required_skills: [
      { skill_id: "sk-node", weight: 5 },
      { skill_id: "sk-python", weight: 4 },
      { skill_id: "sk-sql", weight: 5 },
      { skill_id: "sk-ps", weight: 4 },
      { skill_id: "sk-git", weight: 3 },
    ],
  },
  {
    id: "role-da",
    title: "Data Analyst",
    description: "Turn raw data into insight with SQL, Python and clear storytelling.",
    required_skills: [
      { skill_id: "sk-sql", weight: 5 },
      { skill_id: "sk-python", weight: 5 },
      { skill_id: "sk-ps", weight: 3 },
      { skill_id: "sk-comm", weight: 4 },
      { skill_id: "sk-ml", weight: 2 },
    ],
  },
];

// ---------------- Students ----------------

export const studentProfiles: StudentProfile[] = [
  {
    id: "s1",
    email: "student@skillpulse.dev",
    name: "Aarav Sharma",
    college: "National Institute of Technology, Pune",
    course: "B.Tech Computer Science",
    graduation_year: 2027,
    headline: "Aspiring full stack developer · Building projects with React & Node",
    skills: [
      { skill_id: "sk-js", level: 78 },
      { skill_id: "sk-react", level: 82 },
      { skill_id: "sk-ts", level: 55 },
      { skill_id: "sk-node", level: 48 },
      { skill_id: "sk-sql", level: 35 },
      { skill_id: "sk-git", level: 70 },
      { skill_id: "sk-ps", level: 62 },
      { skill_id: "sk-comm", level: 66 },
    ],
    target_role_id: "role-fs",
    profile_completion: 86,
  },
  {
    id: "s2",
    email: "priya.patel@college.edu",
    name: "Priya Patel",
    college: "National Institute of Technology, Pune",
    course: "B.Tech Information Technology",
    graduation_year: 2027,
    headline: "Frontend enthusiast · React, TypeScript & design systems",
    skills: [
      { skill_id: "sk-js", level: 88 },
      { skill_id: "sk-react", level: 91 },
      { skill_id: "sk-ts", level: 84 },
      { skill_id: "sk-git", level: 80 },
      { skill_id: "sk-comm", level: 78 },
      { skill_id: "sk-ps", level: 72 },
    ],
    target_role_id: "role-fe",
    profile_completion: 94,
  },
  {
    id: "s3",
    email: "rohan.mehta@college.edu",
    name: "Rohan Mehta",
    college: "National Institute of Technology, Pune",
    course: "B.Tech Data Science",
    graduation_year: 2026,
    headline: "Data analyst in the making · SQL, Python & visualization",
    skills: [
      { skill_id: "sk-python", level: 86 },
      { skill_id: "sk-sql", level: 83 },
      { skill_id: "sk-ml", level: 68 },
      { skill_id: "sk-ps", level: 75 },
      { skill_id: "sk-comm", level: 81 },
      { skill_id: "sk-git", level: 64 },
    ],
    target_role_id: "role-da",
    profile_completion: 90,
  },
  {
    id: "s4",
    email: "sneha.reddy@college.edu",
    name: "Sneha Reddy",
    college: "National Institute of Technology, Pune",
    course: "B.Tech Computer Science",
    graduation_year: 2026,
    headline: "Backend-focused developer · APIs, databases and cloud basics",
    skills: [
      { skill_id: "sk-node", level: 84 },
      { skill_id: "sk-python", level: 79 },
      { skill_id: "sk-sql", level: 81 },
      { skill_id: "sk-ps", level: 77 },
      { skill_id: "sk-git", level: 75 },
      { skill_id: "sk-js", level: 70 },
    ],
    target_role_id: "role-be",
    profile_completion: 88,
  },
  {
    id: "s5",
    email: "arjun.nair@college.edu",
    name: "Arjun Nair",
    college: "National Institute of Technology, Pune",
    course: "B.Tech Computer Science",
    graduation_year: 2028,
    headline: "Second-year explorer · Learning web development step by step",
    skills: [
      { skill_id: "sk-js", level: 52 },
      { skill_id: "sk-react", level: 41 },
      { skill_id: "sk-git", level: 45 },
      { skill_id: "sk-ps", level: 50 },
      { skill_id: "sk-sql", level: 30 },
    ],
    target_role_id: "role-fs",
    profile_completion: 58,
  },
];

// ---------------- Recruiter & college profiles ----------------

export const recruiterProfiles: RecruiterProfile[] = [
  {
    id: "r1",
    email: "recruiter@skillpulse.dev",
    name: "Kavya Krishnan",
    company: "Zentrix Labs",
    company_size: "51-200",
    hiring_for: ["Frontend Engineer", "Full Stack Developer"],
  },
];

export const collegeProfiles: CollegeProfile[] = [
  {
    id: "c1",
    email: "admin@skillpulse.dev",
    name: "Dr. Ramesh Iyer",
    college_name: "National Institute of Technology, Pune",
    department: "Computer Science & Engineering",
    total_students: 5,
  },
];

// ---------------- Assessments ----------------

export const assessments: Assessment[] = [
  {
    id: "as-js",
    skill_id: "sk-js",
    title: "JavaScript Fundamentals",
    description: "Core language concepts: types, closures, async and array methods.",
    duration_minutes: 15,
    questions: [
      {
        id: "jsq1", type: "mcq", points: 10,
        prompt: "What is the output of: typeof null?",
        options: ["'null'", "'object'", "'undefined'", "'boolean'"],
        correct_option: 1,
        explanation: "typeof null returns 'object' due to a legacy bug in JavaScript that was never fixed for compatibility.",
      },
      {
        id: "jsq2", type: "mcq", points: 10,
        prompt: "Which array method returns a new array without modifying the original?",
        options: ["splice()", "sort()", "map()", "push()"],
        correct_option: 2,
        explanation: "map() creates a new array by applying a function to each element; the original array is untouched.",
      },
      {
        id: "jsq3", type: "mcq", points: 10,
        prompt: "What does a closure give you access to?",
        options: [
          "Only global variables",
          "The outer function's scope even after it returns",
          "Only the function's own parameters",
          "The DOM directly",
        ],
        correct_option: 1,
        explanation: "A closure retains access to the outer function's lexical scope even after the outer function has finished executing.",
      },
      {
        id: "jsq4", type: "mcq", points: 10,
        prompt: "Which statement about let vs var is correct?",
        options: [
          "var is block-scoped",
          "let is hoisted and initialized as undefined",
          "let is block-scoped, var is function-scoped",
          "They behave identically",
        ],
        correct_option: 2,
        explanation: "let is block-scoped while var is function-scoped and hoisted with an undefined initialization.",
      },
      {
        id: "jsq5", type: "coding", points: 20,
        prompt: "Describe what the event loop does in JavaScript and how setTimeout(fn, 0) behaves.",
        keywords: ["call stack", "queue", "async", "non-blocking", "callback", "task queue"],
        explanation: "The event loop moves callbacks from the task queue to the call stack when the stack is empty, so setTimeout(fn, 0) still runs after current synchronous code.",
      },
    ],
  },
  {
    id: "as-react",
    skill_id: "sk-react",
    title: "React Core Concepts",
    description: "Components, hooks, state management and rendering behaviour.",
    duration_minutes: 15,
    questions: [
      {
        id: "rq1", type: "mcq", points: 10,
        prompt: "Which hook lets a function component hold local state?",
        options: ["useEffect", "useState", "useContext", "useMemo"],
        correct_option: 1,
        explanation: "useState returns a state value and a setter function for use inside function components.",
      },
      {
        id: "rq2", type: "mcq", points: 10,
        prompt: "When does useEffect with an empty dependency array run?",
        options: ["On every render", "Only once after the initial render", "Never", "Before the first render"],
        correct_option: 1,
        explanation: "An empty dependency array means the effect has no dependencies, so it runs only after the initial render.",
      },
      {
        id: "rq3", type: "mcq", points: 10,
        prompt: "Why should list items have stable keys?",
        options: [
          "Keys are optional styling hints",
          "React uses keys to identify which items changed between renders",
          "Keys improve SEO",
          "Keys are required by JSX syntax only",
        ],
        correct_option: 1,
        explanation: "Keys let React's reconciler match elements across renders so it can update only what changed.",
      },
      {
        id: "rq4", type: "mcq", points: 10,
        prompt: "What is 'lifting state up'?",
        options: [
          "Moving state to a global store always",
          "Moving shared state to the closest common ancestor component",
          "Passing state via the DOM",
          "Using useRef instead of useState",
        ],
        correct_option: 1,
        explanation: "When two components need the same state, move it to their closest common ancestor and pass it down via props.",
      },
      {
        id: "rq5", type: "coding", points: 20,
        prompt: "Explain the difference between useMemo and useCallback and give one scenario where each helps.",
        keywords: ["memoize", "value", "function", "reference", "performance", "expensive", "dependency"],
        explanation: "useMemo memoizes a computed value; useCallback memoizes a function reference — useful to avoid unnecessary re-renders of memoized children or recomputing expensive values.",
      },
    ],
  },
  {
    id: "as-sql",
    skill_id: "sk-sql",
    title: "SQL Essentials",
    description: "Queries, joins, aggregation and indexing fundamentals.",
    duration_minutes: 12,
    questions: [
      {
        id: "sq1", type: "mcq", points: 10,
        prompt: "Which JOIN returns only rows with matching values in both tables?",
        options: ["LEFT JOIN", "INNER JOIN", "FULL OUTER JOIN", "CROSS JOIN"],
        correct_option: 1,
        explanation: "INNER JOIN returns rows where the join condition matches in both tables.",
      },
      {
        id: "sq2", type: "mcq", points: 10,
        prompt: "Which clause filters rows AFTER aggregation?",
        options: ["WHERE", "GROUP BY", "HAVING", "ORDER BY"],
        correct_option: 2,
        explanation: "HAVING filters grouped results; WHERE filters rows before grouping.",
      },
      {
        id: "sq3", type: "mcq", points: 10,
        prompt: "What does COUNT(*) count?",
        options: ["Only non-null values in the first column", "All rows including nulls", "Only distinct rows", "Only numeric values"],
        correct_option: 1,
        explanation: "COUNT(*) counts every row; COUNT(column) skips NULLs in that column.",
      },
      {
        id: "sq4", type: "coding", points: 20,
        prompt: "Write or describe a query to find the second-highest salary from an employees table.",
        keywords: ["order by", "salary", "limit", "offset", "max", "subquery", "desc"],
        explanation: "Common approaches: ORDER BY salary DESC LIMIT 1 OFFSET 1, or MAX(salary) WHERE salary < (SELECT MAX(salary) ...).",
      },
    ],
  },
  {
    id: "as-node",
    skill_id: "sk-node",
    title: "Node.js & Express Basics",
    description: "Runtime fundamentals, REST APIs and middleware.",
    duration_minutes: 12,
    questions: [
      {
        id: "nq1", type: "mcq", points: 10,
        prompt: "Node.js executes JavaScript using which engine?",
        options: ["SpiderMonkey", "V8", "Chakra", "Hermes"],
        correct_option: 1,
        explanation: "Node.js is built on Google's V8 JavaScript engine.",
      },
      {
        id: "nq2", type: "mcq", points: 10,
        prompt: "What is Express middleware?",
        options: [
          "A database driver",
          "Functions that run between the request and response with access to req, res, next",
          "A templating engine",
          "A testing framework",
        ],
        correct_option: 1,
        explanation: "Middleware functions execute in order during the request-response cycle and can modify req/res or end the cycle.",
      },
      {
        id: "nq3", type: "mcq", points: 10,
        prompt: "Which statement about Node's concurrency model is true?",
        options: [
          "It uses one thread per request",
          "It is single-threaded with an event loop and non-blocking I/O",
          "It cannot handle I/O",
          "It always runs synchronous code",
        ],
        correct_option: 1,
        explanation: "Node handles concurrency with a single-threaded event loop and offloads I/O, avoiding thread-per-request overhead.",
      },
      {
        id: "nq4", type: "coding", points: 20,
        prompt: "Describe how you would structure a REST API endpoint that creates a user and validates input.",
        keywords: ["route", "post", "validate", "controller", "middleware", "status", "error"],
        explanation: "Typical structure: POST /users route → validation middleware (e.g. zod/joi) → controller → service/db → 201 response or 400 on validation failure.",
      },
    ],
  },
  {
    id: "as-python",
    skill_id: "sk-python",
    title: "Python Programming",
    description: "Core Python: data structures, comprehensions and functions.",
    duration_minutes: 12,
    questions: [
      {
        id: "pq1", type: "mcq", points: 10,
        prompt: "Which data structure is immutable?",
        options: ["list", "dict", "tuple", "set"],
        correct_option: 2,
        explanation: "Tuples cannot be modified after creation; lists, dicts and sets are mutable.",
      },
      {
        id: "pq2", type: "mcq", points: 10,
        prompt: "What does [x*2 for x in range(3)] produce?",
        options: ["[0, 1, 2]", "[2, 4, 6]", "[0, 2, 4]", "[1, 2, 3]"],
        correct_option: 2,
        explanation: "range(3) yields 0,1,2 and each is doubled → [0, 2, 4].",
      },
      {
        id: "pq3", type: "mcq", points: 10,
        prompt: "How are function arguments passed in Python?",
        options: ["By value only", "By reference only", "By object reference (pass-by-assignment)", "By pointer"],
        correct_option: 2,
        explanation: "Python passes references to objects; whether mutation is visible depends on the object's mutability.",
      },
      {
        id: "pq4", type: "coding", points: 20,
        prompt: "Describe how you would count word frequencies in a large text file efficiently in Python.",
        keywords: ["counter", "dictionary", "collections", "loop", "split", "read"],
        explanation: "collections.Counter over the split tokens, reading the file line-by-line to bound memory usage.",
      },
    ],
  },
  {
    id: "as-ts",
    skill_id: "sk-ts",
    title: "TypeScript Essentials",
    description: "Type system, interfaces, generics and strict mode.",
    duration_minutes: 12,
    questions: [
      {
        id: "tq1", type: "mcq", points: 10,
        prompt: "What is the difference between interface and type?",
        options: [
          "They are always identical",
          "Interfaces support declaration merging; types support unions and intersections more flexibly",
          "Types can only describe objects",
          "Interfaces cannot be extended",
        ],
        correct_option: 1,
        explanation: "Interfaces merge when declared repeatedly and are extended with 'extends'; type aliases handle unions, intersections and primitives.",
      },
      {
        id: "tq2", type: "mcq", points: 10,
        prompt: "What does the 'strict' compiler option enable?",
        options: [
          "Faster builds",
          "A family of strict type-checking options including strictNullChecks",
          "Runtime validation",
          "Automatic linting",
        ],
        correct_option: 1,
        explanation: "strict turns on strictNullChecks, noImplicitAny and related checks that catch more errors at compile time.",
      },
      {
        id: "tq3", type: "mcq", points: 10,
        prompt: "Which utility type makes all properties of T optional?",
        options: ["Required<T>", "Partial<T>", "Pick<T, K>", "Omit<T, K>"],
        correct_option: 1,
        explanation: "Partial<T> maps every property of T to optional.",
      },
      {
        id: "tq4", type: "coding", points: 20,
        prompt: "Explain what generics are and write/describe a generic function signature for an identity function.",
        keywords: ["generic", "type parameter", "reusable", "<t>", "type safety", "identity"],
        explanation: "Generics parameterize types so code is reusable and type-safe, e.g. function identity<T>(arg: T): T { return arg; }.",
      },
    ],
  },
];

// ---------------- Assessment attempts ----------------

export const assessmentAttempts: AssessmentAttempt[] = [
  {
    id: "att-1", assessment_id: "as-react", student_id: "s1", skill_id: "sk-react",
    score: 49, total: 60, percentage: 82, time_taken_seconds: 640,
    completed_at: "2026-09-18T10:30:00Z",
    answers: [
      { question_id: "rq1", answer: "useState", correct: true },
      { question_id: "rq2", answer: "Only once after the initial render", correct: true },
      { question_id: "rq3", answer: "React uses keys to identify which items changed between renders", correct: true },
      { question_id: "rq4", answer: "Moving shared state to the closest common ancestor component", correct: true },
      { question_id: "rq5", answer: "useMemo memoizes a computed value while useCallback memoizes a function reference to keep stable props.", correct: true },
    ],
  },
  {
    id: "att-2", assessment_id: "as-js", student_id: "s1", skill_id: "sk-js",
    score: 44, total: 60, percentage: 73, time_taken_seconds: 720,
    completed_at: "2026-09-12T14:05:00Z",
    answers: [
      { question_id: "jsq1", answer: "'object'", correct: true },
      { question_id: "jsq2", answer: "map()", correct: true },
      { question_id: "jsq3", answer: "The outer function's scope even after it returns", correct: true },
      { question_id: "jsq4", answer: "They behave identically", correct: false },
      { question_id: "jsq5", answer: "The event loop checks the call stack and pushes queued callbacks when the stack is empty.", correct: true },
    ],
  },
  {
    id: "att-3", assessment_id: "as-sql", student_id: "s1", skill_id: "sk-sql",
    score: 20, total: 50, percentage: 40, time_taken_seconds: 540,
    completed_at: "2026-09-05T09:15:00Z",
    answers: [
      { question_id: "sq1", answer: "INNER JOIN", correct: true },
      { question_id: "sq2", answer: "WHERE", correct: false },
      { question_id: "sq3", answer: "All rows including nulls", correct: true },
      { question_id: "sq4", answer: "SELECT MAX(salary) FROM employees", correct: false },
    ],
  },
  {
    id: "att-4", assessment_id: "as-react", student_id: "s2", skill_id: "sk-react",
    score: 56, total: 60, percentage: 93, time_taken_seconds: 580,
    completed_at: "2026-09-20T11:00:00Z", answers: [],
  },
  {
    id: "att-5", assessment_id: "as-js", student_id: "s2", skill_id: "sk-js",
    score: 52, total: 60, percentage: 87, time_taken_seconds: 610,
    completed_at: "2026-09-14T16:20:00Z", answers: [],
  },
  {
    id: "att-6", assessment_id: "as-ts", student_id: "s2", skill_id: "sk-ts",
    score: 45, total: 50, percentage: 90, time_taken_seconds: 500,
    completed_at: "2026-09-16T12:40:00Z", answers: [],
  },
  {
    id: "att-7", assessment_id: "as-python", student_id: "s3", skill_id: "sk-python",
    score: 46, total: 50, percentage: 92, time_taken_seconds: 470,
    completed_at: "2026-09-19T10:10:00Z", answers: [],
  },
  {
    id: "att-8", assessment_id: "as-sql", student_id: "s3", skill_id: "sk-sql",
    score: 41, total: 50, percentage: 82, time_taken_seconds: 520,
    completed_at: "2026-09-11T15:30:00Z", answers: [],
  },
  {
    id: "att-9", assessment_id: "as-node", student_id: "s4", skill_id: "sk-node",
    score: 44, total: 50, percentage: 88, time_taken_seconds: 490,
    completed_at: "2026-09-17T09:45:00Z", answers: [],
  },
  {
    id: "att-10", assessment_id: "as-sql", student_id: "s4", skill_id: "sk-sql",
    score: 39, total: 50, percentage: 78, time_taken_seconds: 560,
    completed_at: "2026-09-09T13:00:00Z", answers: [],
  },
  {
    id: "att-11", assessment_id: "as-js", student_id: "s5", skill_id: "sk-js",
    score: 28, total: 60, percentage: 47, time_taken_seconds: 800,
    completed_at: "2026-09-15T17:10:00Z", answers: [],
  },
];

// ---------------- Projects ----------------

export const projects: Project[] = [
  {
    id: "p1", student_id: "s1", title: "TaskFlow — Team Task Manager",
    description:
      "A full stack task management app with boards, drag-and-drop, real-time updates and team invitations. Built with a React frontend and Node/Express REST API.",
    technologies: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
    github_url: "https://github.com/aaravsharma/taskflow",
    live_url: "https://taskflow-demo.vercel.app",
    evidence: "Deployed live; 40+ commits with PR reviews; handles CRUD, auth and real-time sync via websockets.",
    skills: ["sk-react", "sk-node", "sk-js"],
    verification_status: "verified",
    created_at: "2026-08-02T10:00:00Z",
  },
  {
    id: "p2", student_id: "s1", title: "WeatherLens Dashboard",
    description:
      "A responsive weather dashboard consuming a public API, with location search, 7-day forecasts, cached requests and chart visualizations.",
    technologies: ["JavaScript", "Chart.js", "REST API", "CSS"],
    github_url: "https://github.com/aaravsharma/weatherlens",
    live_url: null,
    evidence: "Clean component structure, debounced search, error/loading states handled for all API calls.",
    skills: ["sk-js"],
    verification_status: "verified",
    created_at: "2026-06-20T10:00:00Z",
  },
  {
    id: "p3", student_id: "s1", title: "Campus Marketplace (in progress)",
    description:
      "A student-to-student marketplace for books and equipment with listings, chat and college-email verification. Currently building the payments flow.",
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    github_url: "https://github.com/aaravsharma/campus-market",
    live_url: null,
    evidence: null,
    skills: ["sk-react", "sk-ts", "sk-sql"],
    verification_status: "pending",
    created_at: "2026-09-10T10:00:00Z",
  },
  {
    id: "p4", student_id: "s2", title: "ShopEasy Design System",
    description:
      "An accessible React component library with 25+ components, theming, Storybook docs and full keyboard navigation support.",
    technologies: ["React", "TypeScript", "Storybook", "Radix UI"],
    github_url: "https://github.com/priyapatel/shopeasy-ds",
    live_url: "https://shopeasy-ds.netlify.app",
    evidence: "Published npm package; 95% Lighthouse accessibility; used by 3 college projects.",
    skills: ["sk-react", "sk-ts"],
    verification_status: "verified",
    created_at: "2026-07-15T10:00:00Z",
  },
  {
    id: "p5", student_id: "s2", title: "Recipe Finder PWA",
    description: "An installable PWA for searching recipes by ingredients with offline support and push notifications.",
    technologies: ["React", "JavaScript", "Service Workers"],
    github_url: "https://github.com/priyapatel/recipe-finder",
    live_url: null,
    evidence: "Offline-first caching strategy; Lighthouse PWA audit passing.",
    skills: ["sk-js", "sk-react"],
    verification_status: "verified",
    created_at: "2026-05-01T10:00:00Z",
  },
  {
    id: "p6", student_id: "s3", title: "Sales Insight Dashboard",
    description:
      "An analytics dashboard over a 1M-row sales dataset: SQL aggregation pipeline, Python ETL and interactive charts for regional trends.",
    technologies: ["Python", "SQL", "Pandas", "Plotly"],
    github_url: "https://github.com/rohanmehta/sales-insight",
    live_url: null,
    evidence: "ETL pipeline documented; queries optimized from 40s to 3s with indexing.",
    skills: ["sk-python", "sk-sql"],
    verification_status: "verified",
    created_at: "2026-08-10T10:00:00Z",
  },
  {
    id: "p7", student_id: "s3", title: "Churn Prediction Study",
    description: "A classification study predicting customer churn with logistic regression and random forests, including feature importance analysis.",
    technologies: ["Python", "scikit-learn", "Pandas"],
    github_url: "https://github.com/rohanmehta/churn-study",
    live_url: null,
    evidence: "Notebook with cross-validation; 0.86 ROC-AUC on held-out set.",
    skills: ["sk-python", "sk-ml"],
    verification_status: "pending",
    created_at: "2026-09-01T10:00:00Z",
  },
  {
    id: "p8", student_id: "s4", title: "URL Shortener API",
    description:
      "A production-style REST API with rate limiting, analytics endpoints, Redis caching and Docker deployment.",
    technologies: ["Node.js", "Express", "Redis", "Docker", "PostgreSQL"],
    github_url: "https://github.com/snehareddy/urlshort",
    live_url: "https://urlshort-api.onrender.com",
    evidence: "Load-tested to 500 rps; OpenAPI docs; CI pipeline with tests.",
    skills: ["sk-node", "sk-sql"],
    verification_status: "verified",
    created_at: "2026-07-28T10:00:00Z",
  },
  {
    id: "p9", student_id: "s5", title: "Personal Portfolio Site",
    description: "A simple static portfolio with projects section and contact form built while learning web basics.",
    technologies: ["HTML", "CSS", "JavaScript"],
    github_url: "https://github.com/arjunnair/portfolio",
    live_url: null,
    evidence: null,
    skills: ["sk-js"],
    verification_status: "unverified",
    created_at: "2026-08-25T10:00:00Z",
  },
];

// ---------------- Certificates ----------------

export const certificates: Certificate[] = [
  {
    id: "cert-1", student_id: "s1", name: "Meta Front-End Developer Professional Certificate",
    issuer: "Coursera · Meta", date: "2026-07-10",
    credential_url: "https://coursera.org/verify/demo-aarav-fe", skill_id: "sk-react",
    verification_status: "verified",
  },
  {
    id: "cert-2", student_id: "s1", name: "JavaScript Algorithms and Data Structures",
    issuer: "freeCodeCamp", date: "2026-05-22",
    credential_url: "https://freecodecamp.org/certification/demo-aarav-js", skill_id: "sk-js",
    verification_status: "verified",
  },
  {
    id: "cert-3", student_id: "s2", name: "Advanced React & Redux",
    issuer: "Udemy", date: "2026-06-30",
    credential_url: "https://udemy.com/certificate/demo-priya-react", skill_id: "sk-react",
    verification_status: "verified",
  },
  {
    id: "cert-4", student_id: "s2", name: "Web Accessibility (WCAG 2.1) Fundamentals",
    issuer: "Deque University", date: "2026-04-18",
    credential_url: null, skill_id: "sk-react", verification_status: "pending",
  },
  {
    id: "cert-5", student_id: "s3", name: "Google Data Analytics Certificate",
    issuer: "Coursera · Google", date: "2026-08-01",
    credential_url: "https://coursera.org/verify/demo-rohan-da", skill_id: "sk-sql",
    verification_status: "verified",
  },
  {
    id: "cert-6", student_id: "s3", name: "Python for Everybody Specialization",
    issuer: "Coursera · University of Michigan", date: "2026-03-12",
    credential_url: "https://coursera.org/verify/demo-rohan-py", skill_id: "sk-python",
    verification_status: "verified",
  },
  {
    id: "cert-7", student_id: "s4", name: "Node.js Backend Development",
    issuer: "Educative", date: "2026-06-05",
    credential_url: "https://educative.io/verify/demo-sneha-node", skill_id: "sk-node",
    verification_status: "verified",
  },
  {
    id: "cert-8", student_id: "s4", name: "AWS Cloud Practitioner Essentials",
    issuer: "AWS Skill Builder", date: "2026-08-20",
    credential_url: null, skill_id: null, verification_status: "pending",
  },
];

// ---------------- AI Viva sessions ----------------

export const vivaSessions: VivaSession[] = [
  {
    id: "viva-1", student_id: "s1", topic_type: "project", topic_id: "p1", topic_name: "TaskFlow — Team Task Manager",
    questions: [
      {
        question: "Walk me through the architecture of TaskFlow. How do the frontend and backend communicate?",
        evaluation: "Strong structural overview — correctly described REST endpoints, auth flow and websocket usage for real-time updates.",
        score: 85,
        feedback: "Great clarity on data flow. Mentioning trade-offs (why websockets over polling) would push this to expert level.",
      },
      {
        question: "How did you handle authentication and session management?",
        evaluation: "Explained JWT-based auth with refresh tokens and httpOnly cookies accurately.",
        score: 80,
        feedback: "Solid answer. Could discuss token revocation strategies for completeness.",
      },
      {
        question: "What was the hardest bug you faced in this project and how did you solve it?",
        evaluation: "Described a race condition in board updates with a concrete debugging process.",
        score: 75,
        feedback: "Good problem-solving narrative; adding how you verified the fix (tests/monitoring) would strengthen it.",
      },
    ],
    answers: [], score: 80,
    strengths: [
      "Clear understanding of full stack data flow",
      "Accurate knowledge of auth mechanisms",
      "Concrete debugging narrative with real project context",
    ],
    improvements: [
      "Discuss architectural trade-offs, not just choices",
      "Mention testing and verification when describing bug fixes",
    ],
    completed_at: "2026-09-20T12:00:00Z",
  },
  {
    id: "viva-2", student_id: "s1", topic_type: "skill", topic_id: "sk-react", topic_name: "React",
    questions: [
      {
        question: "Explain the React rendering lifecycle and when components re-render.",
        evaluation: "Correctly covered state/props changes and reconciliation, with a good example.",
        score: 82, feedback: "Accurate. Could mention React.memo and batching behaviour.",
      },
      {
        question: "How would you optimize a large list rendering in React?",
        evaluation: "Suggested virtualization and keying strategies appropriately.",
        score: 70, feedback: "Right direction — naming react-window/virtual list patterns would show depth.",
      },
    ],
    answers: [], score: 76,
    strengths: ["Strong grasp of core rendering concepts", "Practical optimization intuition"],
    improvements: ["Learn virtualization libraries for large lists", "Study React 18 batching and transitions"],
    completed_at: "2026-09-22T09:30:00Z",
  },
  {
    id: "viva-3", student_id: "s2", topic_type: "project", topic_id: "p4", topic_name: "ShopEasy Design System",
    questions: [
      {
        question: "How do you ensure accessibility across your component library?",
        evaluation: "Detailed ARIA usage, keyboard nav and testing with screen readers.",
        score: 92, feedback: "Excellent, evidence-backed answer.",
      },
      {
        question: "How do you version and ship updates to consumers?",
        evaluation: "Described semver and changelog workflow clearly.",
        score: 85, feedback: "Strong. Mentioning codemods for breaking changes would be a bonus.",
      },
    ],
    answers: [], score: 89,
    strengths: ["Deep accessibility knowledge", "Mature release process understanding"],
    improvements: ["Explore automated visual regression testing"],
    completed_at: "2026-09-21T14:00:00Z",
  },
  {
    id: "viva-4", student_id: "s3", topic_type: "skill", topic_id: "sk-sql", topic_name: "SQL",
    questions: [
      {
        question: "How would you diagnose a slow query?",
        evaluation: "Mentioned EXPLAIN plans and indexing correctly.",
        score: 84, feedback: "Solid practical answer.",
      },
      {
        question: "Explain window functions with an example.",
        evaluation: "Gave a correct ROW_NUMBER partitioning example.",
        score: 78, feedback: "Good; explore RANK vs DENSE_RANK differences.",
      },
    ],
    answers: [], score: 81,
    strengths: ["Practical query optimization knowledge", "Comfortable with window functions"],
    improvements: ["Deepen knowledge of aggregate window frames"],
    completed_at: "2026-09-19T11:15:00Z",
  },
  {
    id: "viva-5", student_id: "s4", topic_type: "project", topic_id: "p8", topic_name: "URL Shortener API",
    questions: [
      {
        question: "Why did you add Redis caching and what did it improve?",
        evaluation: "Quantified latency improvement and explained cache invalidation.",
        score: 88, feedback: "Great use of measured evidence.",
      },
      {
        question: "How does your rate limiter work?",
        evaluation: "Described token bucket implementation accurately.",
        score: 82, feedback: "Clear. Consider distributed rate limiting trade-offs.",
      },
    ],
    answers: [], score: 85,
    strengths: ["Performance-minded design decisions", "Clear explanation of infrastructure choices"],
    improvements: ["Study distributed rate limiting (Redis + sliding window)"],
    completed_at: "2026-09-18T16:45:00Z",
  },
];

// ---------------- Learning resources ----------------

export const learningResources: LearningResource[] = [
  { id: "lr-1", skill_id: "sk-js", title: "JavaScript.info — The Modern JavaScript Tutorial", provider: "javascript.info", resource_type: "documentation", url: "https://javascript.info", level: "beginner" },
  { id: "lr-2", skill_id: "sk-js", title: "You Don't Know JS Yet (book series)", provider: "GitHub", resource_type: "course", url: "https://github.com/getify/You-Dont-Know-JS", level: "advanced" },
  { id: "lr-3", skill_id: "sk-react", title: "React Official Tutorial: Tic-Tac-Toe", provider: "react.dev", resource_type: "documentation", url: "https://react.dev/learn", level: "beginner" },
  { id: "lr-4", skill_id: "sk-react", title: "Epic React — Advanced Patterns", provider: "Kent C. Dodds", resource_type: "course", url: "https://epicreact.dev", level: "advanced" },
  { id: "lr-5", skill_id: "sk-ts", title: "TypeScript Handbook", provider: "typescriptlang.org", resource_type: "documentation", url: "https://www.typescriptlang.org/docs/handbook", level: "intermediate" },
  { id: "lr-6", skill_id: "sk-node", title: "Node.js & Express — Full Course", provider: "freeCodeCamp", resource_type: "video", url: "https://www.freecodecamp.org", level: "beginner" },
  { id: "lr-7", skill_id: "sk-node", title: "Node.js Design Patterns (book)", provider: "Packt", resource_type: "course", url: "https://www.nodejsdesignpatterns.com", level: "advanced" },
  { id: "lr-8", skill_id: "sk-python", title: "Python for Everybody", provider: "Coursera · U. Michigan", resource_type: "course", url: "https://www.coursera.org/specializations/python", level: "beginner" },
  { id: "lr-9", skill_id: "sk-sql", title: "SQLBolt — Interactive SQL Lessons", provider: "sqlbolt.com", resource_type: "practice", url: "https://sqlbolt.com", level: "beginner" },
  { id: "lr-10", skill_id: "sk-sql", title: "Mode SQL Tutorial (Advanced)", provider: "Mode", resource_type: "documentation", url: "https://mode.com/sql-tutorial", level: "advanced" },
  { id: "lr-11", skill_id: "sk-git", title: "Learn Git Branching", provider: "learngitbranching.js.org", resource_type: "practice", url: "https://learngitbranching.js.org", level: "beginner" },
  { id: "lr-12", skill_id: "sk-ps", title: "NeetCode 150 Practice Roadmap", provider: "NeetCode", resource_type: "practice", url: "https://neetcode.io", level: "intermediate" },
  { id: "lr-13", skill_id: "sk-ml", title: "Andrew Ng's Machine Learning Specialization", provider: "Coursera · Stanford", resource_type: "course", url: "https://www.coursera.org/specializations/machine-learning", level: "intermediate" },
  { id: "lr-14", skill_id: "sk-comm", title: "Technical Writing & Communication Guide", provider: "Google", resource_type: "documentation", url: "https://developers.google.com/tech-writing", level: "beginner" },
];

// ---------------- Helpers ----------------

export function getSkill(id: string): Skill | undefined {
  return skills.find((s) => s.id === id);
}

export function getSkillName(id: string): string {
  return getSkill(id)?.name ?? id;
}

export function getRole(id: string | null | undefined): JobRole | undefined {
  return jobRoles.find((r) => r.id === id);
}

export function getStudent(id: string): StudentProfile | undefined {
  return studentProfiles.find((s) => s.id === id);
}
