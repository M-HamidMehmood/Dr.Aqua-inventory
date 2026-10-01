/**
 * Utility for combining conditional CSS class names (shadcn/ui style)
 */
export function cn(...inputs) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export default cn
