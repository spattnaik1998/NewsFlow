import type { Category, Source } from "./types";

export const CATEGORIES: Record<Category, { label: string; color: string; icon: string }> = {
  "ai-ml": { label: "AI & ML", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", icon: "🤖" },
  "web-dev": { label: "Web Dev", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: "🌐" },
  "security": { label: "Security", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: "🔒" },
  "hardware": { label: "Hardware", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", icon: "💻" },
  "open-source": { label: "Open Source", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: "🔓" },
  "cloud-devops": { label: "Cloud & DevOps", color: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200", icon: "☁️" },
  "mobile": { label: "Mobile", color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200", icon: "📱" },
  "research": { label: "Research", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200", icon: "🔬" },
  "programming": { label: "Programming", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: "💡" },
  "business-tech": { label: "Business", color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200", icon: "📊" },
  "uncategorized": { label: "Other", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", icon: "📰" },
};

export const SOURCE_LABELS: Record<Source, string> = {
  "hacker-news": "Hacker News",
  "reddit": "Reddit",
  "arxiv": "arXiv",
  "devto": "Dev.to",
  "github": "GitHub",
  "rss": "RSS",
  "press": "Press",
  "serper": "Google News",
  "tavily": "Deep Search",
  "newsletter": "Newsletter",
  "youtube": "YouTube",
};

export const TTL = {
  FULL_FEED: 2 * 60 * 1000,       // 2 min  — master cache, drives client refresh cadence
  HACKER_NEWS: 2 * 60 * 1000,    // 2 min  — front page turns over fast
  REDDIT: 3 * 60 * 1000,         // 3 min  — hot posts update frequently
  ARXIV: 20 * 60 * 1000,         // 20 min — paper submissions are slow
  DEVTO: 5 * 60 * 1000,          // 5 min
  GITHUB: 10 * 60 * 1000,        // 10 min — trending repos don't change by the minute
  RSS: 3 * 60 * 1000,            // 3 min  — RSS is the fastest breaking-news signal
  PRESS: 5 * 60 * 1000,          // 5 min  — NYT/WaPo/WSJ publish throughout the day
  SERPER: 5 * 60 * 1000,         // 5 min
  TAVILY: 20 * 60 * 1000,        // 20 min — on-demand search only
  AI_SUMMARY: 60 * 60 * 1000,    // 1 hr   — summaries don't need recomputing
  NEWSLETTER: 15 * 60 * 1000,    // 15 min — newsletters publish a few times/day
  YOUTUBE: 30 * 60 * 1000,       // 30 min — video uploads are infrequent
  AI_BRIEFING: 60 * 60 * 1000,   // 1 hr
  AI_INSIGHT: 2 * 60 * 60 * 1000, // 2 hr
} as const;

export const RSS_FEEDS = [
  { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
  { name: "Wired", url: "https://www.wired.com/feed/rss" },
];

export const PRESS_FEEDS = [
  { name: "New York Times", url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml" },
  { name: "Washington Post", url: "https://feeds.washingtonpost.com/rss/business/technology" },
  { name: "Wall Street Journal", url: "https://feeds.content.dowjones.io/public/rss/RSSWSJD" },
];

export const NEWSLETTER_FEEDS = [
  { name: "The Pragmatic Engineer", url: "https://newsletter.pragmaticengineer.com/feed" },
  { name: "ByteByteGo", url: "https://blog.bytebytego.com/feed" },
  { name: "The Batch", url: "https://www.deeplearning.ai/the-batch/rss.xml" },
  { name: "Simon Willison", url: "https://simonwillison.net/atom/everything/" },
  { name: "Exponential View", url: "https://www.exponentialview.co/feed" },
];

export const YOUTUBE_CHANNELS = [
  { name: "Fireship", id: "UCsBjURrPoezykLs9EqgamOA" },
  { name: "Lex Fridman", id: "UCSHZKyawb77ixDdsGog4iWA" },
  { name: "Andrej Karpathy", id: "UCBcRF18a7Qf58cCRy5xuWwQ" },
  { name: "ThePrimeTime", id: "UC4mW6v8NdaOAQMjDiRSgdMA" },
];

export const REDDIT_SUBREDDITS = [
  "technology",
  "programming",
  "MachineLearning",
  "artificial",
  "cybersecurity",
  "webdev",
];

export const ARXIV_CATEGORIES = ["cs.AI", "cs.LG", "cs.CR", "cs.PL"];

export const SERPER_QUERIES = [
  "latest AI technology news today",
  "programming language updates",
  "cybersecurity breach vulnerability",
  "open source software release",
  "cloud computing news",
  "startup tech funding",
];

export const KEYWORD_CATEGORIES: Record<Category, string[]> = {
  "ai-ml": ["ai", "artificial intelligence", "machine learning", "llm", "gpt", "neural", "deep learning", "transformer", "openai", "anthropic", "gemini", "claude", "chatgpt", "nlp", "computer vision"],
  "web-dev": ["javascript", "typescript", "react", "vue", "angular", "nextjs", "css", "html", "frontend", "backend", "web", "nodejs", "deno", "bun", "webpack", "vite"],
  "security": ["security", "vulnerability", "exploit", "hack", "breach", "ransomware", "malware", "phishing", "cve", "zero-day", "encryption", "privacy", "authentication", "firewall"],
  "hardware": ["cpu", "gpu", "chip", "processor", "intel", "amd", "apple silicon", "m1", "m2", "m3", "semiconductor", "arm", "risc-v", "hardware", "quantum"],
  "open-source": ["open source", "open-source", "github", "gitlab", "linux", "ubuntu", "debian", "apache", "foss", "free software", "open core", "community"],
  "cloud-devops": ["aws", "azure", "gcp", "kubernetes", "docker", "devops", "ci/cd", "terraform", "cloud", "microservices", "serverless", "containers", "deployment"],
  "mobile": ["ios", "android", "mobile", "swift", "kotlin", "flutter", "react native", "app store", "google play", "iphone", "samsung", "pixel"],
  "research": ["paper", "arxiv", "research", "study", "study finds", "scientists", "university", "phd", "benchmark", "dataset", "model training", "experiment"],
  "programming": ["programming", "coding", "developer", "software", "algorithm", "data structure", "api", "library", "framework", "rust", "go", "python", "java", "c++", "kotlin", "swift"],
  "business-tech": ["startup", "funding", "ipo", "acquisition", "merger", "valuation", "venture", "series", "investment", "revenue", "enterprise", "saas", "b2b"],
  "uncategorized": [],
};

export const PAGE_SIZE = 20;
