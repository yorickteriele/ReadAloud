import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { modules } from './modules.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendRoot = path.resolve(__dirname, '..')
const frontendOpenApiDir = path.resolve(frontendRoot, 'openapi')
const openApiBaseUrl = (process.env.OPENAPI_BASE_URL ?? 'http://localhost:5001').replace(/\/$/, '')

async function fetchSpecs() {
  await mkdir(frontendOpenApiDir, { recursive: true })

  for (const moduleConfig of modules) {
    const endpoint = `${openApiBaseUrl}${moduleConfig.swaggerPath}`
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI for ${moduleConfig.name} from ${endpoint}`)
    }

    const body = await response.text()
    JSON.parse(body)

    const destination = path.join(frontendOpenApiDir, moduleConfig.specFile)
    await writeFile(destination, body, 'utf8')
    console.log(`OpenAPI fetched to ${destination} from ${endpoint}`)
  }
}

await fetchSpecs().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
