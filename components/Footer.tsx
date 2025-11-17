import { FaGithub, FaEnvelope } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="mt-16 bg-indigo-900 text-white py-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-6">
        <div className="flex space-x-6 text-2xl">
          <a href="mailto:sinn357@naver.com" aria-label="Email" className="text-teal-400 hover:text-teal-300 transition">
            <FaEnvelope />
          </a>
          <a
            href="https://github.com/sinn357/new"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-teal-400 hover:text-teal-300 transition"
          >
            <FaGithub />
          </a>
        </div>
        <p className="text-sm text-gray-300">
          © {new Date().getFullYear()} 신우철. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
