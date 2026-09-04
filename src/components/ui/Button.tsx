import clsx from 'clsx'
import { motion, type HTMLMotionProps } from 'motion/react'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'glass'
}

export function Button({ variant = 'primary', className, children, ...rest }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={clsx(
        'rounded-full px-5 py-2.5 text-sm font-medium',
        variant === 'primary' && 'bg-action text-white',
        variant === 'glass' && 'glass text-(--color-text-primary)',
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
