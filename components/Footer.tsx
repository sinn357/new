import { FaGithub, FaEnvelope } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-6">
        <div className="flex space-x-6 text-2xl">
          <a href="mailto:sinn357@naver.com" aria-label="Email">
            <FaEnvelope className="hover:opacity-80 transition" />
          </a>
          <a
            href="https://github.com/sinn357/new"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <FaGithub className="hover:opacity-80 transition" />
          </a>
        </div>
        <p className="text-sm opacity-90">
          © {new Date().getFullYear()} 신우철. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
