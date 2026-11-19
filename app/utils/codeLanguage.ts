const labels: Record<string, string> = {
  cpp: 'C++', c: 'C', python: 'Python', py: 'Python', bash: 'Bash', shell: 'Shell',
  js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', typescript: 'TypeScript',
  json: 'JSON', yaml: 'YAML', html: 'HTML', css: 'CSS', vue: 'Vue'
}

export function languageLabel(language = '') {
  return Object.hasOwn(labels, language) ? labels[language] : language
}
