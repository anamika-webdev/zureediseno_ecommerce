// components/optimized/LazyVideo.tsx - Optimized video component
import { useState, useRef, useEffect } from 'react'

interface LazyVideoProps {
  src: string
  poster?: string
  className?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
}

export function LazyVideo({
  src,
  poster,
  className,
  autoPlay = false,
  loop = false,
  muted = true
}: LazyVideoProps) {
  const [isInView, setIsInView] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      poster={poster}
      playsInline
    >
      {isInView && <source src={src} type="video/mp4" />}
    </video>
  )
}