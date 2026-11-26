import mermaid from 'mermaid'

type Theme = 'light' | 'dark'
let configuredTheme: Theme | undefined
let queue = Promise.resolve()

// Mermaid configuration is shared. Keep initialization and rendering in the
// same queue so concurrent charts cannot change one another's theme mid-draw.
export function renderMermaid(id: string, source: string, theme: Theme, host: HTMLElement, current: () => boolean) {
  const job = queue.then(async () => {
    if (!current()) return
    if (configuredTheme !== theme) {
      mermaid.initialize({
        startOnLoad: false, theme: theme === 'dark' ? 'dark' : 'default',
        // Both layouts ship with Mermaid. Dagre avoids loading ELK for ordinary flowcharts.
        layout: 'dagre', securityLevel: 'strict', htmlLabels: false, suppressErrorRendering: true
      })
      configuredTheme = theme
    }
    try {
      const { svg } = await mermaid.render(id, source, host)
      return svg
    } finally {
      host.replaceChildren()
    }
  })
  queue = job.then(() => {}, () => {})
  return job
}
