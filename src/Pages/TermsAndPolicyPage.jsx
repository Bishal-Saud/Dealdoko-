import React, { useState } from 'react';
import { ShieldCheck, FileText, Scale, Eye, HeartHandshake, CheckCircle2 } from 'lucide-react';
import HomeLayout from '../Layouts/HomeLayout';

function TermsAndPolicyPage() {
  const [activeTab, setActiveTab] = useState('terms'); // 'terms', 'privacy', or 'safety'

  const lastUpdated = "June 2026";

  return (
    <HomeLayout>

   
    <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand & Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <ShieldCheck size={14} className="text-blue-600" /> Trust & Legal Center
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Terms, Privacy & Safety Center
        </h1>
        <p className="text-sm text-slate-500 mt-2 font-medium">
          Our commitment to keeping the local student and home tutor community safe and transparent.
        </p>
        <p className="text-[11px] text-slate-400 font-bold mt-1">
          Last Updated: {lastUpdated}
        </p>
      </div>

      {/* Tab Switcher Interface */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-2xs flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Scale size={16} />
            <span>Terms of Service</span>
          </button>
          
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-blue-500 hover:text-blue-900 hover:bg-blue-50'
            }`}
          >
            <Eye size={16} />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'safety'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HeartHandshake size={16} />
            <span>Safety & Trial Policy</span>
          </button>
        </div>
      </div>

      {/* Dynamic Content Container */}
      <main className="max-w-4xl mx-auto bg-white border border-slate-200/60 rounded-3xl p-6 md:p-10 shadow-xs">
        {activeTab === 'terms' && (
          /* TERMS OF SERVICE CONTENT */
          <div className="space-y-8 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FileText className="text-blue-600" size={20} /> Platform User Agreement
              </h2>
              <p className="text-xs text-slate-400 mt-1">Please read these terms carefully before listing batches or hiring tutors.</p>
            </div>

            <section className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                01. Scope of Marketplace Services
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Our platform functions strictly as an interactive neighborhood directory connecting independent private tutors with prospective parents or students. We do not operate an employment agency, nor are we party to any individual tuition arrangements, private schedules, or external syllabus agreements established between users.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                02. Profile Accountability & Verification
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Educators creating directory profiles must provide complete, honest, and verifiable details regarding their qualifications, continuous target class levels, and localized hub addresses. Any profiles found staging fraudulent pricing matrixes, unverified credentials, or inaccurate neighborhood scopes will face immediate account termination.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                03. Direct Communication & Safety Layouts
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                While we inject proximity analytics and telephone micro-dialers to expedite onboarding connections, parents and independent educators retain complete accountability for safety screening, background/identity mapping, and payment structure enforcement during outside home visits.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                04. Dynamic Pricing & Tuition Fees
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                All monthly baseline prices (e.g., in Nepalese Rupees) presented on active class listing banners are directly configured by the prospective tutors. Platform administration bears zero liability for subsequent financial disputes, cash collection anomalies, or structural curriculum shifts during home execution phases.
              </p>
            </section>
          </div>
        )}

        {activeTab === 'privacy' && (
          /* PRIVACY POLICY CONTENT */
          <div className="space-y-8 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" size={20} /> Personal Data Protection Rules
              </h2>
              <p className="text-xs text-slate-400 mt-1">How we utilize geographic profiles and telephone infrastructure logs.</p>
            </div>

            <section className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                01. Information We Collect
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                To power localized home teacher matching arrays, we extract your explicitly provided account profile name, valid avatar references, configured phone networks, and specific geographical location names (e.g., local home address neighborhoods).
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                02. How Your Geolocation Data is Managed
              </h3>
              <div className="text-xs md:text-sm text-slate-600 leading-relaxed space-y-2">
                <p>Your regional address layer handles two direct system pipelines:</p>
                <ul className="list-disc list-inside space-y-1 pl-2 text-slate-500 font-medium">
                  <li>Filters out relevant neighborhood directories for real-time proximity lookups.</li>
                  <li>Attaches explicit location markers onto product listings so local students see how close you are.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                03. Contact Number Visibility Rules
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                By entering your contact configuration into your verified seller module, you explicitly authorize the system to generate immediate call/dial action layouts (`tel:` references). This exposes the designated communication line to authenticated users requesting on-demand tuition consultations.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                04. Data Deletion Rights
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Users can entirely overwrite structural location coordinates, mask phone connectivity strings, or clear stale tuition directory cards instantly through their personal Account Dashboard. For full server profile purging, support streams can be initiated anytime.
              </p>
            </section>
          </div>
        )}

        {activeTab === 'safety' && (
          /* SAFETY & TRIAL POLICY CONTENT */
          <div className="space-y-8 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <HeartHandshake className="text-rose-600" size={20} /> Safety & Trial Policy
              </h2>
              <p className="text-xs text-slate-400 mt-1">Our core guidelines for ensuring a secure and satisfactory teaching match.</p>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                Crucial Parent Recommendation
              </h3>
              <p className="text-xs md:text-sm text-rose-700 leading-relaxed font-medium">
                We strongly advise against making full, upfront milestone payments before verifying the teacher's capability and compatibility. Protect your funds and confirm educational quality first.
              </p>
            </div>

            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                Onboarding & Evaluation Roadmap
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex gap-3">
                  <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-xs md:text-sm font-black text-slate-800">1. Start with a Trial Period</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      We highly recommend structuring a short initial window (such as a 2-day trial or 1–3 introductory classes) before finalizing any long-term arrangement.
                    </p>
                  </div>
                </div>

                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex gap-3">
                  <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-xs md:text-sm font-black text-slate-800">2. Actively Gather Student Feedback</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Parents are encouraged to sit with or evaluate teaching quality and openly request feedback from their child immediately after the trial classes conclude.
                    </p>
                  </div>
                </div>

                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex gap-3">
                  <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-xs md:text-sm font-black text-slate-800">3. Evaluate and Decide</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Based on your child's learning comfort, choose to securely continue payments or seamlessly shift tracking parameters to find a better matching tutor profile.
                    </p>
                  </div>
                </div>

                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex gap-3">
                  <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-xs md:text-sm font-black text-slate-800">4. Secure Learning Environments</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      For overall safety, all early introduction sessions or classes should be exclusively held inside the student's home with family members actively present or within other deeply trusted community spaces.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Clean Utility Footer */}
      <div className="max-w-4xl mx-auto text-center mt-8">
        <p className="text-xs text-slate-400 font-semibold">
          Have queries regarding community operations? Contact our operations helpdesk.
        </p>
      </div>
    </div>
     </HomeLayout>
  );
}

export default TermsAndPolicyPage;