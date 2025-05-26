'use client'
import { differenceInSeconds } from 'date-fns'
import { useEffect, useState } from 'react'

const DEADLINE = new Date('2025-05-31T21:59:00.000+02:00')
export default function Home() {
  const [timeLeft, setTimeLeft] = useState(
    differenceInSeconds(DEADLINE, Date.now())
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const days = Math.floor(timeLeft / 86400)
  const hours = Math.floor((timeLeft % 86400) / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div>I love ronja</div>
        <div>
          {days} days {hours} hours {minutes} minutes {seconds} seconds
        </div>
      </main>
    </div>
  )
}
