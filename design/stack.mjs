// One row per thing on the profile. Order inside a tier = how much it is used (first = most).
// tier: ai | main (каждый день) | active (активно) | tried (трогал)
// cat colours the periodic table; sym is its element symbol.
export const tiers = ['ai', 'main', 'active', 'tried'];

export const stack = [
  { id: 'claude', name: 'Claude', icon: 'siClaude', tier: 'ai', cat: 'ai', sym: 'Cl', tag: 'main' },
  { id: 'gemini', name: 'Gemini', icon: 'siGooglegemini', tier: 'ai', cat: 'ai', sym: 'Gm', tag: 'second' },
  { id: 'chatgpt', name: 'ChatGPT', icon: 'siOpenai', color: '#10A37F', tier: 'ai', cat: 'ai', sym: 'Gp', tag: 'images' },

  { id: 'windows', name: 'Windows', icon: 'siWindows', tier: 'main', cat: 'os', sym: 'Wn' },
  { id: 'vscode', name: 'VS Code', icon: 'siVisualstudiocode', tier: 'main', cat: 'tool', sym: 'Vs' },
  { id: 'typescript', name: 'TypeScript', icon: 'siTypescript', tier: 'main', cat: 'lang', sym: 'Ts' },
  { id: 'javascript', name: 'JavaScript', icon: 'siJavascript', tier: 'main', cat: 'lang', sym: 'Js' },
  { id: 'nodejs', name: 'Node.js', icon: 'siNodedotjs', tier: 'main', cat: 'web', sym: 'Nd' },
  { id: 'bun', name: 'Bun', icon: 'siBun', tier: 'main', cat: 'web', sym: 'Bn' },
  { id: 'vue', name: 'Vue', icon: 'siVuedotjs', tier: 'main', cat: 'web', sym: 'Vu' },
  { id: 'nuxt', name: 'Nuxt', icon: 'siNuxt', tier: 'main', cat: 'web', sym: 'Nx' },
  { id: 'java', name: 'Java', icon: 'java', tier: 'main', cat: 'lang', sym: 'Jv' },
  { id: 'git', name: 'Git', icon: 'siGit', tier: 'main', cat: 'tool', sym: 'Gt' },
  { id: 'actions', name: 'Actions', icon: 'siGithubactions', tier: 'main', cat: 'infra', sym: 'Ac' },
  { id: 'obsidian', name: 'Obsidian', icon: 'siObsidian', tier: 'main', cat: 'tool', sym: 'Ob' },
  { id: 'kotlin', name: 'Kotlin', icon: 'siKotlin', tier: 'main', cat: 'lang', sym: 'Kt' },
  { id: 'gradle', name: 'Gradle', icon: 'siGradle', tier: 'main', cat: 'tool', sym: 'Gr' },

  { id: 'docker', name: 'Docker', icon: 'siDocker', tier: 'active', cat: 'infra', sym: 'Dk' },
  { id: 'csharp', name: 'C#', icon: 'siCsharp', tier: 'active', cat: 'lang', sym: 'Cs' },
  { id: 'python', name: 'Python', icon: 'siPython', tier: 'active', cat: 'lang', sym: 'Py' },
  { id: 'react', name: 'React', icon: 'siReact', tier: 'active', cat: 'web', sym: 'Re' },
  { id: 'html', name: 'HTML', icon: 'siHtml5', tier: 'active', cat: 'web', sym: 'Ht' },
  { id: 'css', name: 'CSS', icon: 'siCss', tier: 'active', cat: 'web', sym: 'Cc' },
  { id: 'sass', name: 'Sass', icon: 'siSass', tier: 'active', cat: 'web', sym: 'Sa' },
  { id: 'postgresql', name: 'PostgreSQL', icon: 'siPostgresql', tier: 'active', cat: 'data', sym: 'Pg' },
  { id: 'redis', name: 'Redis', icon: 'siRedis', tier: 'active', cat: 'data', sym: 'Rd' },
  { id: 'sqlite', name: 'SQLite', icon: 'siSqlite', color: '#5BA4DB', tier: 'active', cat: 'data', sym: 'Sq' },
  { id: 'nginx', name: 'Nginx', icon: 'siNginx', tier: 'active', cat: 'infra', sym: 'Ng' },
  { id: 'debian', name: 'Debian', icon: 'siDebian', color: '#D70A53', tier: 'active', cat: 'os', sym: 'Db' },
  { id: 'intellij', name: 'IntelliJ', icon: 'siIntellijidea', tier: 'active', cat: 'tool', sym: 'Ij' },
  { id: 'go', name: 'Go', icon: 'siGo', tier: 'active', cat: 'lang', sym: 'Go' },
  { id: 'rust', name: 'Rust', icon: 'siRust', tier: 'active', cat: 'lang', sym: 'Rs' },
  { id: 'firebase', name: 'Firebase', icon: 'siFirebase', tier: 'active', cat: 'data', sym: 'Fb' },
  { id: 'mysql', name: 'MySQL', icon: 'siMysql', color: '#5D9BC4', tier: 'active', cat: 'data', sym: 'My' },
  { id: 'lmdb', name: 'LMDB', icon: 'siDatabricks', tier: 'active', cat: 'data', sym: 'Lm' },
  { id: 'vite', name: 'Vite', icon: 'siVite', tier: 'active', cat: 'web', sym: 'Vt' },
  { id: 'tailwind', name: 'Tailwind', icon: 'siTailwindcss', tier: 'active', cat: 'web', sym: 'Tw' },
  { id: 'discordjs', name: 'discord.js', icon: 'siDiscorddotjs', tier: 'active', cat: 'web', sym: 'Dj' },
  { id: 'mindustry', name: 'Mindustry', icon: 'custom:mindustry', tier: 'active', cat: 'game', sym: 'Mi' },
  { id: 'minecraft', name: 'Minecraft', icon: 'custom:minecraft', tier: 'active', cat: 'game', sym: 'Mc' },
  { id: 'lavalink', name: 'Lavalink', icon: 'custom:lavalink', tier: 'active', cat: 'infra', sym: 'Ll' },

  { id: 'mongodb', name: 'MongoDB', icon: 'siMongodb', tier: 'tried', cat: 'data', sym: 'Mg' },
  { id: 'ubuntu', name: 'Ubuntu', icon: 'siUbuntu', tier: 'tried', cat: 'os', sym: 'Ub' },
  { id: 'android', name: 'Android', icon: 'siAndroid', tier: 'tried', cat: 'os', sym: 'An' },
  { id: 'unity', name: 'Unity', icon: 'siUnity', tier: 'tried', cat: 'tool', sym: 'Un' },
  { id: 'sublime', name: 'Sublime', icon: 'siSublimetext', tier: 'tried', cat: 'tool', sym: 'Sb' },
  { id: 'ejs', name: 'EJS', icon: 'siEjs', tier: 'tried', cat: 'web', sym: 'Ej' },
  { id: 'figma', name: 'Figma', icon: 'siFigma', tier: 'tried', cat: 'tool', sym: 'Fg' },
  { id: 'drawio', name: 'draw.io', icon: 'siDiagramsdotnet', tier: 'tried', cat: 'tool', sym: 'Dw' },
  { id: 'notion', name: 'Notion', icon: 'siNotion', tier: 'tried', cat: 'tool', sym: 'No' },
  { id: 'gdrive', name: 'Drive', icon: 'siGoogledrive', tier: 'tried', cat: 'tool', sym: 'Gd' },
  { id: 'pterodactyl', name: 'Pterodactyl', icon: 'siPterodactyl', color: '#4F8FD6', tier: 'tried', cat: 'infra', sym: 'Pt' },
  { id: 'json', name: 'JSON', icon: 'siJson', tier: 'tried', cat: 'format', sym: 'Jn' },
  { id: 'yaml', name: 'YAML', icon: 'siYaml', color: '#E8434F', tier: 'tried', cat: 'format', sym: 'Ym' },
  { id: 'toml', name: 'TOML', icon: 'siToml', color: '#C9693B', tier: 'tried', cat: 'format', sym: 'Tm' },
  { id: 'env', name: '.env', icon: 'siDotenv', tier: 'tried', cat: 'format', sym: 'Ev' },
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
