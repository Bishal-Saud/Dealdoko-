import React, { Children } from 'react'

import Header from '../components/header';
import Footer from '../components/Footer';
function HomeLayout({children}) {
  return (
     <div className="min-h-screen bg-gray-50 text-slate-800 pb-24 md:pb-0 font-sans">
 <Header/>
      {children}
   <Footer/>
    </div>
  )
}

export default HomeLayout
