"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"

const ScrollableGallery = ({ children, title, icon: Icon }) => {
  const scrollContainerRef = useRef(null)

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = direction === "left" ? -current.offsetWidth * 0.8 : current.offsetWidth * 0.8
      current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto mb-16">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold gradient-text flex items-center">
            {Icon && <Icon className="mr-3 h-8 w-8 text-primary" />}
            {title}
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              className="rounded-full hover:bg-primary/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              className="rounded-full hover:bg-primary/10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <div ref={scrollContainerRef} className="flex overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
        {children}
      </div>
    </div>
  )
}

export default ScrollableGallery

