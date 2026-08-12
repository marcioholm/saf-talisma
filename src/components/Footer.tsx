'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✓ Inscrito com sucesso!');
        setEmail('');
      } else {
        setMessage(data.error || 'Erro ao inscrever');
      }
    } catch (error) {
      setMessage('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">SAF Talismã</h3>
            <p className="text-gray-400 text-sm">
              Transformando vidas através do futsal desde 2009.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/noticias" className="hover:text-white transition">
                  Notícias
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-white transition">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/transparencia" className="hover:text-white transition">
                  Transparência
                </Link>
              </li>
              <li>
                <Link href="/patrocinadores" className="hover:text-white transition">
                  Patrocinadores
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex gap-2">
                <Mail className="w-4 h-4 mt-0.5" />
                <a href="mailto:contato@saftalisma.com.br" className="hover:text-white transition">
                  contato@saftalisma.com.br
                </a>
              </li>
              <li className="flex gap-2">
                <Phone className="w-4 h-4 mt-0.5" />
                <a href="tel:+554235551234" className="hover:text-white transition">
                  (42) 3555-1234
                </a>
              </li>
              <li className="flex gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Arapoti, PR</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <form onSubmit={handleNewsletter} className="space-y-2">
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm font-medium transition"
              >
                {loading ? 'Enviando...' : 'Inscrever'}
              </button>
              {message && (
                <p
                  className={`text-xs ${
                    message.startsWith('✓')
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2024 SAF Talismã. Todos os direitos reservados.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="https://instagram.com/saftalisma" className="hover:text-white transition">
                Instagram
              </a>
              <a href="https://facebook.com/saftalisma" className="hover:text-white transition">
                Facebook
              </a>
              <a href="https://whatsapp.me/saftalisma" className="hover:text-white transition">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
