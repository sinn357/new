'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Contact() {
  const [text, setText] = useState('');
  const [response, setResponse] = useState<{ text?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/echo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      const data = await res.json();
      setResponse(data);
    } catch {
      setResponse({ error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <nav className="mb-8">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Home
        </Link>
      </nav>
      
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Contact Form</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="text" className="block text-sm font-medium mb-2">
              Message:
            </label>
            <input
              id="text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your message"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
        
        {response && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h3 className="font-medium mb-2">Response:</h3>
            <pre className="text-sm">{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}