import React, { useEffect } from "react"
import { motion, stagger, useAnimate } from "framer-motion"

export function TextGenerateEffect({ words, className = "" }) {
  const [scope, animate] = useAnimate()
  const wordsArray = words.split(" ")

  useEffect(() => {
    if (scope.current) {
      animate(
        "span",
        { opacity: 1 },
        { duration: 2, delay: stagger(0.2) }
      )
    }
  }, [scope.current])

  return (
    <motion.div ref={scope} className={className}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={idx}
          className="text-gray-400 opacity-0"
          style={{ marginRight: "0.25rem" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  )
}
