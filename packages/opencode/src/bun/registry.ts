import semver from "semver"
import { Log } from "../util/log"
import { Process } from "../util/process"

export namespace PackageRegistry {
  const log = Log.create({ service: "bun" })

  function which() {
    return process.execPath
  }

  export async function info(pkg: string, field: string, cwd?: string): Promise<string | null> {
    const { code, stdout, stderr } = await Process.run([which(), "info", pkg, field], {
      cwd,
      env: {
        ...process.env,
        BUN_BE_BUN: "1",
      },
      nothrow: true,
    })

    if (code !== 0) {
      log.warn("bun info failed", { pkg, field, code, stderr: stderr.toString() })
      return null
    }

    const value = stdout.toString().trim()
    if (!value) return null
    return value
  }

  export async function isOutdated(pkg: string, cachedVersion: string, cwd?: string): Promise<boolean> {
    const latestVersion = await info(pkg, "version", cwd)
    if (!latestVersion) {
      log.warn("Failed to resolve latest version, using cached", { pkg, cachedVersion })
      return false
    }

    const isRange = /[\s^~*xX<>|=]/.test(cachedVersion)
    if (isRange) {
      const range = semver.validRange(cachedVersion)
      if (!range) {
        log.warn("Invalid cached version range, treating as outdated", { pkg, cachedVersion, latestVersion })
        return true
      }
      return !semver.satisfies(latestVersion, range)
    }

    const cached = semver.valid(cachedVersion)
    const latest = semver.valid(latestVersion)
    if (!cached || !latest) {
      log.warn("Invalid version value, treating as outdated", { pkg, cachedVersion, latestVersion })
      return true
    }

    return semver.lt(cached, latest)
  }
}
