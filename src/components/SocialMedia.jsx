import React from 'react'
import { FaLinkedin, FaTiktok, FaFacebook, FaYoutube, FaInstagram } from 'react-icons/fa';
function SocialMedia() {
      const socialLinks = [
  { name: "LinkedIn", icon: <FaLinkedin size={20} />, url: "https://www.linkedin.com/in/tolpath/" },
  { name: "TikTok", icon: <FaTiktok size={20} />, url: "https://www.tiktok.com/@tolpath" },
  { name: "Facebook", icon: <FaFacebook size={20} />, url: "https://www.facebook.com/profile.php?id=61590670261469" },
  { name: "YouTube", icon: <FaYoutube size={20} />, url: "https://www.youtube.com/@TolPath01" },
  { name: "Instagram", icon: <FaInstagram size={20} />, url: "https://www.instagram.com/tolpath.official/" }
];
  return (
    <div>
      <section className="max-w-4xl mx-auto mt-5 mb-16 text-center">
  <h3 className="text-sm font-black text-slate-900 mb-6">FOLLOW OUR JOURNEY</h3>
  <div className="flex flex-wrap justify-center gap-4">
    {socialLinks.map((social, index) => (
      <a
        key={index}
        href={social.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-white border border-slate-200 p-3 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition text-slate-600 hover:text-blue-600 shadow-sm"
        aria-label={`Visit our ${social.name} page`}
      >
        {social.icon}
        <span className="text-xs font-bold hidden sm:block">{social.name}</span>
      </a>
    ))}
  </div>
</section>
    </div>
  )
}

export default SocialMedia
