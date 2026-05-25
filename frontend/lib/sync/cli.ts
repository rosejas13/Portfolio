import { runSync } from './runner'
import { createGitHubAdapter } from './github'

async function main() {
  const command = process.argv[2]

  if (!command) {
    console.error('Usage: npx tsx lib/sync/cli.ts <source>')
    console.error('Sources: github, linkedin')
    process.exit(1)
  }

  switch (command) {
    case 'github': {
      const owner = process.env.GITHUB_OWNER || 'jcrose'
      const adapter = createGitHubAdapter(owner)
      const result = await runSync(adapter)
      console.log(JSON.stringify(result))
      process.exit(result.success ? 0 : 1)
      break
    }
    default:
      console.error(`Unknown source: ${command}`)
      process.exit(1)
  }
}

main()
