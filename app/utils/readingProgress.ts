// A long article starts when its top reaches the header and finishes when
// its bottom enters the viewport. A short article can fit in a single screen.
export function readingProgress(top: number, height: number, viewport: number, header: number) {
  const available = viewport - header
  if (height <= 0 || available <= 0) return 0
  const fraction = height <= available
    ? (viewport - top) / height
    : (header - top) / (height - available)
  return Math.min(1, Math.max(0, fraction))
}

export function showBackToTop(scrollY: number, height: number, viewport: number) {
  return height > viewport && scrollY > Math.max(400, viewport * 0.8)
}
