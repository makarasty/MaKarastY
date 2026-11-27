// One row per thing on the profile. Order inside a tier = how much it is used (first = most).
// tier: ai | main (каждый день) | active (активно) | tried (трогал)
// cat colours the periodic table; sym is its element symbol.
// score: the user's own 1-10 rating (2026-11-27); higher sits closer to the centre.
export const tiers = ['ai', 'main', 'active', 'tried'];

export const stack = [
  { id: 'claude', name: 'Claude', icon: 'siClaude', tier: 'ai', cat: 'ai', sym: 'Cl', tag: 'main' },
  { id: 'gemini', name: 'Gemini', icon: 'siGooglegemini', tier: 'ai', cat: 'ai', sym: 'Gm', tag: 'second' },
  { id: 'chatgpt', name: 'ChatGPT', icon: 'siOpenai', color: '#10A37F', tier: 'ai', cat: 'ai', sym: 'Gp', tag: 'images' },

  { id: 'windows', name: 'Windows', icon: 'siWindows', tier: 'main', cat: 'os', sym: 'Wn', score: 10 },
  { id: 'vscode', name: 'VS Code', icon: 'siVisualstudiocode', tier: 'main', cat: 'tool', sym: 'Vs', score: 10 },
  { id: 'typescript', name: 'TypeScript', icon: 'siTypescript', tier: 'main', cat: 'lang', sym: 'Ts', score: 9 },
  { id: 'javascript', name: 'JavaScript', icon: 'siJavascript', tier: 'main', cat: 'lang', sym: 'Js', score: 9 },
  { id: 'nodejs', name: 'Node.js', icon: 'siNodedotjs', tier: 'main', cat: 'web', sym: 'Nd', score: 9 },
  { id: 'bun', name: 'Bun', icon: 'siBun', tier: 'main', cat: 'web', sym: 'Bn', score: 10 },
  { id: 'vue', name: 'Vue', icon: 'siVuedotjs', tier: 'main', cat: 'web', sym: 'Vu', score: 9 },
  { id: 'nuxt', name: 'Nuxt', icon: 'siNuxt', tier: 'main', cat: 'web', sym: 'Nx', score: 10 },
  { id: 'java', name: 'Java', icon: 'java', tier: 'main', cat: 'lang', sym: 'Jv', score: 7 },
  { id: 'git', name: 'Git', icon: 'siGit', tier: 'main', cat: 'tool', sym: 'Gt', score: 10 },
  { id: 'actions', name: 'Actions', icon: 'siGithubactions', tier: 'main', cat: 'infra', sym: 'Ac', score: 7 },
  { id: 'obsidian', name: 'Obsidian', icon: 'siObsidian', tier: 'main', cat: 'tool', sym: 'Ob', score: 10 },
  { id: 'kotlin', name: 'Kotlin', icon: 'siKotlin', tier: 'main', cat: 'lang', sym: 'Kt', score: 6 },
  { id: 'gradle', name: 'Gradle', icon: 'siGradle', tier: 'main', cat: 'tool', sym: 'Gr', score: 8 },

  { id: 'docker', name: 'Docker', icon: 'siDocker', tier: 'active', cat: 'infra', sym: 'Dk', score: 6 },
  { id: 'csharp', name: 'C#', icon: 'siCsharp', tier: 'active', cat: 'lang', sym: 'Cs', score: 7 },
  { id: 'python', name: 'Python', icon: 'siPython', tier: 'active', cat: 'lang', sym: 'Py', score: 8 },
  { id: 'react', name: 'React', icon: 'siReact', tier: 'active', cat: 'web', sym: 'Re', score: 6 },
  { id: 'html', name: 'HTML', icon: 'siHtml5', tier: 'active', cat: 'web', sym: 'Ht', score: 10 },
  { id: 'css', name: 'CSS', icon: 'siCss', tier: 'active', cat: 'web', sym: 'Cc', score: 8 },
  { id: 'sass', name: 'Sass', icon: 'siSass', tier: 'active', cat: 'web', sym: 'Sa', score: 8 },
  { id: 'postgresql', name: 'PostgreSQL', icon: 'siPostgresql', tier: 'active', cat: 'data', sym: 'Pg', score: 10 },
  { id: 'redis', name: 'Redis', icon: 'siRedis', tier: 'active', cat: 'data', sym: 'Rd', score: 9 },
  { id: 'sqlite', name: 'SQLite', icon: 'siSqlite', color: '#5BA4DB', tier: 'active', cat: 'data', sym: 'Sq', score: 10 },
  { id: 'nginx', name: 'Nginx', icon: 'siNginx', tier: 'active', cat: 'infra', sym: 'Ng', score: 10 },
  { id: 'debian', name: 'Debian', icon: 'siDebian', color: '#D70A53', tier: 'active', cat: 'os', sym: 'Db', score: 10 },
  { id: 'intellij', name: 'IntelliJ', icon: 'siIntellijidea', tier: 'active', cat: 'tool', sym: 'Ij', score: 7 },
  { id: 'go', name: 'Go', icon: 'siGo', tier: 'active', cat: 'lang', sym: 'Go', score: 9 },
  { id: 'rust', name: 'Rust', icon: 'siRust', tier: 'active', cat: 'lang', sym: 'Rs', score: 9 },
  { id: 'firebase', name: 'Firebase', icon: 'siFirebase', tier: 'active', cat: 'data', sym: 'Fb', score: 9 },
  { id: 'mysql', name: 'MySQL', icon: 'siMysql', color: '#5D9BC4', tier: 'active', cat: 'data', sym: 'My', score: 8 },
  { id: 'lmdb', name: 'LMDB', icon: 'siDatabricks', tier: 'active', cat: 'data', sym: 'Lm', score: 10 },
  { id: 'vite', name: 'Vite', icon: 'siVite', tier: 'active', cat: 'web', sym: 'Vt', score: 9 },
  { id: 'tailwind', name: 'Tailwind', icon: 'siTailwindcss', tier: 'active', cat: 'web', sym: 'Tw', score: 10 },
  { id: 'discordjs', name: 'discord.js', icon: 'siDiscorddotjs', tier: 'active', cat: 'web', sym: 'Dj', score: 10 },
  { id: 'mindustry', name: 'Mindustry', icon: 'custom:mindustry', tier: 'active', cat: 'game', sym: 'Mi', score: 10 },
  { id: 'minecraft', name: 'Minecraft', icon: 'custom:minecraft', tier: 'active', cat: 'game', sym: 'Mc', score: 10 },
  { id: 'lavalink', name: 'Lavalink', icon: 'custom:lavalink', tier: 'active', cat: 'infra', sym: 'Ll', score: 10 },

  { id: 'mongodb', name: 'MongoDB', icon: 'siMongodb', tier: 'tried', cat: 'data', sym: 'Mg', score: 9 },
  { id: 'ubuntu', name: 'Ubuntu', icon: 'siUbuntu', tier: 'tried', cat: 'os', sym: 'Ub', score: 10 },
  { id: 'android', name: 'Android', icon: 'siAndroid', tier: 'tried', cat: 'os', sym: 'An', score: 10 },
  { id: 'unity', name: 'Unity', icon: 'siUnity', tier: 'tried', cat: 'tool', sym: 'Un', score: 5 },
  { id: 'sublime', name: 'Sublime', icon: 'siSublimetext', tier: 'tried', cat: 'tool', sym: 'Sb', score: 10 },
  { id: 'ejs', name: 'EJS', icon: 'siEjs', tier: 'tried', cat: 'web', sym: 'Ej', score: 5 },
  { id: 'figma', name: 'Figma', icon: 'siFigma', tier: 'tried', cat: 'tool', sym: 'Fg', score: 8 },
  { id: 'drawio', name: 'draw.io', icon: 'siDiagramsdotnet', tier: 'tried', cat: 'tool', sym: 'Dw', score: 4 },
  { id: 'notion', name: 'Notion', icon: 'siNotion', tier: 'tried', cat: 'tool', sym: 'No', score: 7 },
  { id: 'gdrive', name: 'Drive', icon: 'siGoogledrive', tier: 'tried', cat: 'tool', sym: 'Gd', score: 4 },
  { id: 'pterodactyl', name: 'Pterodactyl', icon: 'siPterodactyl', color: '#4F8FD6', tier: 'tried', cat: 'infra', sym: 'Pt', score: 7 },
  { id: 'json', name: 'JSON', icon: 'siJson', tier: 'tried', cat: 'format', sym: 'Jn', score: 9 },
  { id: 'yaml', name: 'YAML', icon: 'siYaml', color: '#E8434F', tier: 'tried', cat: 'format', sym: 'Ym', score: 10 },
  { id: 'toml', name: 'TOML', icon: 'siToml', color: '#C9693B', tier: 'tried', cat: 'format', sym: 'Tm', score: 9 },
  { id: 'csv', name: 'CSV', icon: 'custom:csv', tier: 'tried', cat: 'format', sym: 'Cv' },
  { id: 'env', name: '.env', icon: 'siDotenv', tier: 'tried', cat: 'format', sym: 'Ev', score: 10 },
];

// Clickable cards under the stack, in two groups: how to reach me, and everything else.
// Services link is kept as it is in README.md.
export const links = [
  { id: 'telegram', group: 'contact', name: 'Telegram', icon: 'siTelegram', href: 'https://t.me/makarasty/' },
  { id: 'proton', group: 'contact', name: 'Proton', icon: 'siProtonmail', href: 'mailto:makarasty@proton.me' },
  { id: 'gmail', group: 'contact', name: 'Gmail', icon: 'siGmail', href: 'mailto:makarastydev@gmail.com' },
  { id: 'npm', group: 'other', name: 'npm', icon: 'siNpm', href: 'https://www.npmjs.com/~makarasty' },
  { id: 'codewars', group: 'other', name: 'Codewars', icon: 'siCodewars', href: 'https://www.codewars.com/users/MaKarastY' },
  { id: 'monkeytype', group: 'other', name: 'Monkeytype', icon: 'siMonkeytype', href: 'https://monkeytype.com/profile/MaKarastY' },
  { id: 'services', group: 'other', name: 'Services', icon: 'siUptimekuma', color: '#5CDD8B', href: 'https://stats.uptimerobot.com/knqRXIY3qY' },
];
