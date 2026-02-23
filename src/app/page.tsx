import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Hero */}
      <div className="max-w-3xl mx-auto">
        <span className="text-7xl mb-6 block">📒</span>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Share Your Ideas{' '}
          <span className="text-blue-600 dark:text-blue-400">With The World</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
          A modern blogging platform built for writers. Create, share, and
          discover stories that matter.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/blog">
            <Button size="lg" className="min-w-40">
              Browse Posts
            </Button>
          </Link>
          <Link href="/blog/create">
            <Button variant="outline" size="lg" className="min-w-40">
              Start Writing
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto w-full">
        {[
          {
            icon: '🔐',
            title: 'Secure Auth',
            desc: 'JWT + bcrypt authentication with HTTP-only cookies',
          },
          {
            icon: '📝',
            title: 'Rich Editor',
            desc: 'Write with a fully-featured TipTap rich text editor',
          },
          {
            icon: '🚀',
            title: 'Lightning Fast',
            desc: 'Powered by Next.js App Router and MongoDB Atlas',
          },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 text-center"
          >
            <span className="text-4xl mb-3 block">{icon}</span>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
