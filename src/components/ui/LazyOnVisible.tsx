import { useEffect, useRef, useState, type ReactNode } from 'react'

interface LazyOnVisibleProps {
  children: ReactNode
  placeholder: ReactNode
  /** Pre-mounts slightly before the element actually scrolls into view, so there's no visible
   * pop-in flash right at the viewport edge. */
  rootMargin?: string
}

/**
 * Defers mounting `children` until this wrapper scrolls near the viewport — for a lazy dashboard
 * card, that means its code-split chunk import AND its live-query subscription both wait until
 * then, not just the chunk (React.lazy alone only defers the code, not when the component's
 * hooks start running once mounted). Once visible, stays mounted permanently — this is a
 * mount-once gate, not virtualization, so a card's live data doesn't reset on scroll-away.
 */
export function LazyOnVisible({ children, placeholder, rootMargin = '200px' }: LazyOnVisibleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (visible) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visible, rootMargin])

  return <div ref={ref}>{visible ? children : placeholder}</div>
}
