'use client'
import React, { useEffect, useState } from 'react'

const ViewCounter = ({ slug }) => {
  const [views, setViews] = useState(0)

  useEffect(() => {
    // In a real implementation, this would fetch view count from a database
    // For now, we'll just use a random number between 100-1000
    const randomViews = Math.floor(Math.random() * 900) + 100
    setViews(randomViews)
    
    // You could implement actual view tracking here
    // Example: increment view count in database
  }, [slug])

  return <span>{views} views</span>
}

export default ViewCounter
