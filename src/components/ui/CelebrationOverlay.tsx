import { onCelebration } from '@/engine/celebration/celebrationBus'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

const PARTICLE_COUNT = 14
const PARTICLE_EMOJI = ['🎉', '✨', '🔥', '💪']
const VISIBLE_DURATION_MS = 1500

interface Particle {
  id: number
  emoji: string
  angle: number
  distance: number
}

function makeParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    emoji: PARTICLE_EMOJI[i % PARTICLE_EMOJI.length],
    angle: (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.5,
    distance: 80 + Math.random() * 60,
  }))
}

/**
 * A lightweight, dependency-free stand-in for the original spec's "Lottie confetti" — a burst
 * of emoji particles built with Framer Motion (already a dependency) rather than pulling in a
 * Lottie player + JSON asset for one moment. Mount once near the app root; any action can fire
 * it via engine/celebration/celebrationBus without importing this component directly.
 */
export function CelebrationOverlay() {
  const [particles, setParticles] = useState<Particle[] | null>(null)

  useEffect(() => {
    return onCelebration(() => {
      setParticles(makeParticles())
      const timeout = setTimeout(() => setParticles(null), VISIBLE_DURATION_MS)
      return () => clearTimeout(timeout)
    })
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <AnimatePresence>
        {particles?.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute text-2xl"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
            animate={{
              x: Math.cos(particle.angle) * particle.distance,
              y: Math.sin(particle.angle) * particle.distance,
              opacity: 0,
              scale: 1.2,
              transition: { duration: VISIBLE_DURATION_MS / 1000, ease: 'easeOut' },
            }}
            // Fast, explicit exit transition — without this, exit inherits the 1.5s flight
            // duration above (even though opacity is already ~0 by then) and the now-invisible
            // node lingers in the DOM for another 1.5s before actually unmounting.
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            {particle.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
