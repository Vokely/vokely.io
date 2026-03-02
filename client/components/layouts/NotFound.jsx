import React from 'react'
import Navbar from './Navbar'

export default function NotFound() {
  return (
    <div className="h-screen bg-white text-black">
        <Navbar/>
        <div className="flex flex-col items-center justify-center gap-5 h-[90vh]">
          <div className="text-center">
            <p className="text-primary">Page not found- Oops seems like you have lost your path</p>
            <h1 className="font-medium text-[32px]">Don't worry we're always here to guide you</h1>
            <h2 className="text-gray-400">Explore our AI-powered tools to boost your job search</h2>
          </div>

          <div className="flex gap-5">
            <a href="/ai-interviewer">
            <button className="border-[1px] rounded-md text-primary border-primary px-12 py-2">AI Interviewer</button>
            </a>

            <a href="/dashboard">
            <button className="rounded-md bg-primary text-white px-12 py-2">AI Resume Builder</button>
            </a>      
          </div>

          <div className="img-container h-[40vh] w-auto"><img src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/404.png`} alt="page-not-found" /></div>
        </div>
      </div>
  )
}
