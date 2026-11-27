import { readdir, readFile, realpath, stat } from 'node:fs/promises'
import { relative, resolve, sep } from 'node:path'
import { parse } from 'yaml'
import { projectSchema } from '../project-schema.ts'
import { featuredContents } from '../app/utils/featured.ts'
import { isCalendarDate, isGitHubProjectUrl, isLocalCover } from '../app/utils/projects.ts'

const maxProjectBytes = 512 * 1024
const maxFrontmatterBytes = 16 * 1024

async function hasCover(root, cover) {
  if (!isLocalCover(cover)) return false
  const publicDir = resolve(root, 'public')
  try {
    const path = await realpath(resolve(publicDir, '.' + cover))
    const file = await stat(path)
    return path.startsWith(await realpath(publicDir) + sep) && file.isFile() && file.size > 0
  } catch {
    return false
  }
}

export async function validateProjectSources(root) {
  const directory = resolve(root, 'content/projects')
  const files = await readdir(directory, { recursive: true, withFileTypes: true }).catch(error => {
    if (error.code === 'ENOENT') return []
    throw error
  })
  const slugs = new Map()

  for (const entry of files) {
    if (!entry.name.endsWith('.md') || entry.isDirectory()) continue
    const path = resolve(entry.parentPath, entry.name)
    const source = relative(root, path)
    const fail = reason => { throw new Error(`${source}：${reason}`) }
    if (!entry.isFile() || (await stat(path)).size > maxProjectBytes) fail('项目 Markdown 必须是普通文件，且大小不超过 512 KiB。')
    const markdown = await readFile(path, 'utf8')
    const header = markdown.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---[\t ]*(?:\r?\n|$)/)?.[1]
    if (!header || Buffer.byteLength(header) > maxFrontmatterBytes) fail('项目需要有效的 YAML Frontmatter，且大小不超过 16 KiB。')
    let raw
    try {
      raw = parse(header, { maxAliasCount: 0 })
    } catch (error) {
      fail(`无法解析 YAML Frontmatter：${error.message}`)
    }
    if (typeof raw === 'object' && raw && 'technologies' in raw
      && Array.isArray(raw.technologies) && raw.technologies.length > 16) fail('technologies 最多包含 16 项。')
    const result = projectSchema.safeParse(raw)
    if (!result.success) {
      throw new Error(`${source}：${result.error.issues.map(issue => `${issue.path.join('.')} ${issue.message}`).join('，')}`)
    }
    const { slug, startDate, updated, github, cover } = result.data
    const first = slugs.get(slug)
    if (first) fail(`slug ${slug} 与 ${first} 重复。`)
    slugs.set(slug, source)
    if (startDate !== undefined && !isCalendarDate(startDate)) fail('startDate 必须是有效的 YYYY-MM-DD 日期。')
    if (updated !== undefined && !isCalendarDate(updated)) fail('updated 必须是有效的 YYYY-MM-DD 日期。')
    if (github && !isGitHubProjectUrl(github)) fail('github 必须是 https://github.com/所有者/仓库 格式的公开仓库链接。')
    if (cover && !await hasCover(root, cover)) fail('cover 必须指向 public/images 内存在的本地图片。')
  }
}

export async function getFeaturedCovers(root) {
  const covers = new Set()
  for (const selection of featuredContents) {
    if (typeof selection?.cover === 'string' && await hasCover(root, selection.cover)) covers.add(selection.cover)
  }
  return [...covers]
}
