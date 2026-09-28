'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollToTop() {
  const pathname = usePathname()
  const prevPathRef = useRef(pathname)

  // Configure history scroll restoration to manual
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      try {
        window.history.scrollRestoration = 'manual'
      } catch (e) {
        // Fallback gracefully
      }
    }
  }, [])

  // Universal scroll to top function targeting window, html, and body
  const performScrollReset = (instant = true) => {
    const behavior = instant ? 'instant' : 'smooth'
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: behavior
      })
    } catch (e) {
      window.scrollTo(0, 0)
    }

    if (document.documentElement) {
      document.documentElement.scrollTop = 0
    }
    if (document.body) {
      document.body.scrollTop = 0
    }
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0
    }
  }

  // 1. Reset on pathname (route) changes
  useEffect(() => {
    // If URL contains an anchor hash (e.g. #faq, #booking-calendar), allow smooth navigation to it
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashId = window.location.hash.replace('#', '')
      const scrollToHash = () => {
        const el = document.getElementById(hashId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
          return true
        }
        return false
      }

      if (!scrollToHash()) {
        const retryTimer = setTimeout(scrollToHash, 120)
        prevPathRef.current = pathname
        return () => clearTimeout(retryTimer)
      }
      prevPathRef.current = pathname
      return
    }

    // Otherwise, immediately and reliably reset scroll to (0, 0)
    performScrollReset(true)

    // Re-verify on animation frame (once DOM nodes mount)
    const animId = requestAnimationFrame(() => {
      performScrollReset(true)
    })

    // Micro-delay fallbacks to defeat delayed Next.js App Router scroll retention & layout shifts
    const timer1 = setTimeout(() => {
      performScrollReset(true)
    }, 40)

    const timer2 = setTimeout(() => {
      performScrollReset(true)
    }, 120)

    prevPathRef.current = pathname

    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [pathname])

  // 2. Global click interceptor for all navigation links (footer, navbar, in-page links)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleDocumentClick = (e) => {
      const anchor = e.target?.closest?.('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Ignore external protocols, target="_blank", mailto, tel, javascript, etc.
      if (
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        anchor.getAttribute('target') === '_blank'
      ) {
        return
      }

      // If it's a hash anchor on the current page (e.g. href="#apply" or href="#section")
      if (href.startsWith('#')) {
        return
      }

      const currentPath = window.location.pathname
      const targetPath = href.split('?')[0].split('#')[0]

      const isSamePath =
        targetPath === currentPath ||
        targetPath === currentPath.replace(/\/$/, '') ||
        targetPath + '/' === currentPath

      if (isSamePath) {
        // If clicking a link to the current page without a hash (e.g. footer link to same page)
        if (!href.includes('#')) {
          performScrollReset(false)
        }
      }
      // For different-page navigation: do NOT scroll the current page.
      // The new page will be scrolled to top by the pathname-change useEffect.
    }

    // Handle browser back/forward buttons
    const handlePopState = () => {
      if (!window.location.hash) {
        performScrollReset(true)
        setTimeout(() => performScrollReset(true), 50)
      }
    }

    document.addEventListener('click', handleDocumentClick, { capture: true, passive: true })
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true })
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  return null
}
