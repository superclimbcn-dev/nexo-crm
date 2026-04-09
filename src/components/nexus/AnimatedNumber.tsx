'use client'

import { useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  format?: (value: number) => string
  className?: string
}

export function AnimatedNumber({
  value,
  format = (current) => Math.round(current).toString(),
  className,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 90,
  })
  const displayValue = useTransform(springValue, (current) => format(current))

  useEffect(() => {
    motionValue.set(value)
  }, [motionValue, value])

  return <motion.span className={className}>{displayValue}</motion.span>
}
