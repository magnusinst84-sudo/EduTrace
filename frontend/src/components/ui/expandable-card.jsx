import React, { useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useOutsideClick } from "../../hooks/use-outside-click"
import { X } from "lucide-react"

export function ExpandableCard({ card, onClose }) {
  const ref = useRef(null)
  useOutsideClick(ref, onClose)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          ref={ref}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl 
                     overflow-hidden z-50 relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 
                          border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {card.title}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {card.subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
          {/* Content */}
          <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {card.content}
          </div>
        </motion.div>
      </motion.div>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
    </AnimatePresence>
  )
}
