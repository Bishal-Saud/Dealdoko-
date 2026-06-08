import React from 'react';
import { HelpCircle, Search, CheckCircle2, BookOpen, Clock, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet'; // Recommended for SEO

function AskedQuestionPage() {
  const faqs = [
    {
      q: "How can I find the best home tutor near me in Nepal?",
      a: "Finding a reliable home tutor is easy with Tolpath. Simply use our 'Neighborhood Directory' to filter verified educators by your location and subject requirements."
    },
    {
      q: "Are the tutors on Tolpath verified?",
      a: "Yes! We prioritize safety. All our registered tutors undergo a verification process to ensure they provide a secure and high-quality learning environment for your child."
    },
    {
      q: "What subjects are available for home tuition?",
      a: "Tolpath offers expert tutors for Mathematics, Science, English, Physics, Chemistry, Accountancy, and comprehensive support for primary-level schooling."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-20">
      {/* SEO Metadata (If using react-helmet) */}
      <Helmet>
        <title>Frequently Asked Questions | Home Tuition Near Me | Tolpath Nepal</title>
        <meta name="description" content="Have questions about home tuition in Nepal? Tolpath provides answers about finding verified, local home tutors for Math, Science, and more." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-600 font-medium">
            Everything you need to know about finding top-rated home tutors with Tolpath.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <h2 className="text-lg font-black text-slate-900 flex items-start gap-3 mb-2">
                <HelpCircle className="text-blue-600 shrink-0 mt-1" size={20} />
                {item.q}
              </h2>
              <p className="text-slate-600 font-medium text-sm leading-relaxed pl-8">
                {item.a}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section (SEO for local intent) */}
        <div className="mt-12 bg-slate-900 rounded-3xl p-8 text-center text-white">
          <h3 className="text-xl font-black mb-4">Still need a tutor?</h3>
          <p className="text-slate-400 mb-6 text-sm">Join hundreds of parents in Nepal finding academic success today.</p>
          <a href="/" className="inline-block bg-blue-600 px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
            Browse Tutors Near Me
          </a>
        </div>
      </div>
    </div>
  );
}

export default AskedQuestionPage;