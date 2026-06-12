import { ArrowRight, Sparkles } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

function LocationAccess() {

  return (
 <div className="bg-gradient-to-r from-amber-50/60 via-orange-50/40 to-blue-50/30 border border-amber-200/60 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden shadow-xs">

            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3">

              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shrink-0 mt-0.5 shadow-2xs">

                <Sparkles size={22} className="animate-pulse" />

              </div>

              <div>

                <h3 className="text-base md:text-lg font-black text-slate-900">Find the Perfect Home Tutor Near You</h3>

                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl mt-0.5">

                  You haven't customized your matching neighborhood hub yet. Update your address layer to automatically extract home teachers taking batches down your street!

                </p>

              </div>

            </div>

            <Link to="/verify" className="px-5 py-2.5 bg-blue-600 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-sm">

              <span>Add Your Location</span>

              <ArrowRight size={14} />

            </Link>

          </div>
  )
}

export default LocationAccess
