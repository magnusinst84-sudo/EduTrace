import React, { useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

export function Vortex({
  children,
  className,
  containerClassName,
  particleCount = 700,
  rangeY = 100,
  baseHue = 220,
  baseSpeed = 0.0,
  rangeSpeed = 1.5,
  baseRadius = 1,
  rangeRadius = 2,
  backgroundColor = "#0f0f1a",
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])
  const tickRef = useRef(0)

  const rand = (n) => n * Math.random()
  const randRange = (n) => n - rand(2 * n)
  const fadeInOut = (t, m) => {
    let hm = 0.5 * m
    return Math.abs(((t + hm) % m) - hm) / hm
  }
  const lerp = (n1, n2, speed) => (1 - speed) * n1 + speed * n2

  const initParticle = useCallback((particle) => {
    const canvas = canvasRef.current
    if (!canvas) return
    particle.x = rand(canvas.width)
    particle.y = rand(canvas.height)
    particle.vx = 0
    particle.vy = 0
    particle.life = 0
    particle.ttl = 100 + rand(300)
    particle.speed = baseSpeed + rand(rangeSpeed)
    particle.radius = baseRadius + rand(rangeRadius)
    particle.hue = baseHue + randRange(30)
  }, [baseSpeed, rangeSpeed, baseRadius, rangeRadius, baseHue])

  const drawParticle = useCallback((ctx, particle) => {
    const { x, y, radius, hue, ttl, life } = particle
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fillStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`
    ctx.fill()
    ctx.restore()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext("2d")

    const resize = () => {
      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    particlesRef.current = Array.from({ length: particleCount }, () => {
      const p = {}
      initParticle(p)
      p.life = rand(p.ttl)
      return p
    })

    const draw = () => {
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vx = lerp(p.vx, Math.cos((tickRef.current * 0.002) + p.x * 0.001) * p.speed, 0.05)
        p.vy = lerp(p.vy, Math.sin((tickRef.current * 0.002) + p.y * 0.001) * p.speed + rangeY * 0.01, 0.05)
        p.life++
        if (p.life > p.ttl) initParticle(p)
        drawParticle(ctx, p)
      })

      tickRef.current++
      animationRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener("resize", resize)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [particleCount, backgroundColor, rangeY, initParticle, drawParticle])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", containerClassName)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <motion.div
        className={cn("relative z-10", className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        {children}
      </motion.div>
    </div>
  )
}
