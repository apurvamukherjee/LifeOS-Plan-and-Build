import clsx from 'clsx'
import { motion, type HTMLMotionProps } from 'motion/react'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  /** Applies a spring tap-scale, for cards that act as buttons. */
  interactive?: boolean
}

export function GlassCard({ children, className, interactive = false, ...rest }: GlassCardProps) {
  return (
    <motion.div
      className={clsx('glass rounded-3xl p-5', className)}
      whileTap={interactive ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
