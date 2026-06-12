import React, { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export function Timeline({ data }) {
  const ref = useRef(null)
  const containerRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (ref.current) setHeight(ref.current.getBoundingClientRect().height)
  }, [ref, data])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  })

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height])
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1])

  return (
    <div ref={containerRef} className="w-full font-sans">
      <div ref={ref} className="relative max-w-2xl mx-auto pb-20">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-10 gap-6">
            {/* Dot + line container */}
            <div className="sticky flex flex-col items-center 
                            top-40 self-start z-40">
              <div className="h-10 w-10 rounded-full bg-white 
                              border border-gray-200 flex items-center 
                              justify-center shadow-sm flex-shrink-0">
                <div className="h-3 w-3 rounded-full bg-indigo-500" />
              </div>
            </div>
            {/* Content */}
            <div className="flex-1 pb-8">
              <p className="text-sm font-semibold text-indigo-600 mb-1">
                {item.title}
              </p>
              <div className="text-gray-600 text-sm leading-relaxed">
                {item.content}
              </div>
            </div>
          </div>
        ))}

        {/* Animated line */}
        <div
          className="w-px bg-gray-200"
          style={{ height: `${height}px`, position: "absolute", left: "18px", top: 0 }}
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              background:
                "linear-gradient(to bottom, #6366f1, #8b5cf6, transparent)",
              borderRadius: "9999px",
            }}
          />
        </div>
      </div>
    </div>
  )
}
