"use client"

import { useEffect, useState, useRef } from "react"

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [canHide, setCanHide] = useState(false)
  const loadingScreenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanHide(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (canHide && loadingScreenRef.current) {
      const handleTransitionEnd = (event: TransitionEvent) => {
        if (event.propertyName === 'transform') {
          setIsVisible(false);
          onLoadingComplete();
        }
      };

      const currentRef = loadingScreenRef.current;
      currentRef.addEventListener('transitionend', handleTransitionEnd);

      return () => {
        currentRef.removeEventListener('transitionend', handleTransitionEnd);
      };
    }
  }, [canHide, onLoadingComplete]);

  return (
    <div
      ref={loadingScreenRef}
      className={`fixed inset-0 z-50 flex bg-[radial-gradient(ellipse_at_bottom_left,_#1a0f0a,_#2d1b0e,_#000000)] h-screen w-full items-center justify-center transition-transform duration-800 ease-in-out
        ${canHide ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="absolute inset-0" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="animate-spin-slow mb-6">
          <img src="/logo-orng.svg" alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24" />
        </div>
        <div className="flex space-x-1 mt-4">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  )
}