import { access, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { modules } from './modules.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)
const frontendRoot = path.resolve(__dirname, '..')
const openapiDir = path.join(frontendRoot, 'openapi')

function getNswagCliPath() {
  try {
    const nswagPackageJsonPath = require.resolve('nswag/package.json')
    return path.join(path.dirname(nswagPackageJsonPath), 'bin', 'nswag.js')
  } catch {
    throw new Error('NSwag is not installed locally. Run "npm install" in src/frontend before generating clients.')
  }
}

async function ensureSpecExists(moduleName, specPath) {
  try {
    await access(specPath)
  } catch {
    throw new Error(`Missing spec for ${moduleName} at ${specPath}. Run "npm run generate:openapi" first.`)
  }
}

function runNswag(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [getNswagCliPath(), ...args], {
      cwd: frontendRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        DOTNET_ROLL_FORWARD: 'Major',
      },
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`NSwag exited with code ${code}`))
      }
    })
  })
}

async function generateClients() {
  for (const moduleConfig of modules) {
    const specPath = path.join(openapiDir, moduleConfig.specFile)
    const outputPath = path.join(frontendRoot, moduleConfig.output)

    await ensureSpecExists(moduleConfig.name, specPath)
    await mkdir(path.dirname(outputPath), { recursive: true })

    const args = [
      'openapi2tsclient',
      `/input:${specPath}`,
      `/output:${outputPath}`,
      `/className:${moduleConfig.className}`,
      '/template:Fetch',
      '/generateClientClasses:true',
      '/generateClientInterfaces:false',
      '/generateDtoTypes:true',
      '/generateOptionalParameters:true',
      '/useAbortSignal:true',
      '/typeStyle:Interface',
      '/enumStyle:StringLiteral',
      '/typeScriptVersion:5.0',
      '/nullValue:Undefined',
    ]

    console.log(`Generating client for ${moduleConfig.name} -> ${outputPath}`)
    await runNswag(args)
  }

  console.log('NSwag client generation completed')
}

await generateClients().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
