import { execSync } from 'child_process'

export default function globalSetup() {
  // Run Prisma migrations before tests
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
}</content>
<parameter name="filePath">F:\Taitil Graphics\marketplace\prisma\migrate.ts