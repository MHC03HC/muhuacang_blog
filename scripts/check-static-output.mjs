import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const outputRoot = resolve('.output/public')
const pageChecks = [
  ['index.html', '欢迎来到阿木木的菜鸟成长基地'],
  ['blog/index.html', '博客文章'],
  ['blog/blog-officially-starts/index.html', '我的个人博客正式启用'],
  ['wiki/index.html', 'Wiki'],
  ['wiki/cpp/index.html', 'C++探索之旅'],
  ['about/index.html', '关于我'],
  ['search/index.html', '搜索结果'],
  ['404.html', '页面走丢了']
]

const failures = []

for (const [relativePath, expectedText] of pageChecks) {
  const absolutePath = resolve(outputRoot, relativePath)

  try {
    const html = await readFile(absolutePath, 'utf8')
    if (!html.includes(expectedText)) {
      failures.push(`${relativePath} 缺少预期内容：${expectedText}`)
    }
  } catch {
    failures.push(`${relativePath} 不存在或无法读取`)
  }
}

for (const relativePath of ['favicon.svg', 'images/avatar.webp']) {
  try {
    const file = await stat(resolve(outputRoot, relativePath))
    if (!file.isFile() || file.size === 0) {
      failures.push(`${relativePath} 不是有效文件`)
    }
  } catch {
    failures.push(`${relativePath} 不存在`)
  }
}

if (failures.length) {
  console.error('静态站点检查失败：')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`静态站点检查通过：${pageChecks.length} 个页面，2 个公共资源。`)
