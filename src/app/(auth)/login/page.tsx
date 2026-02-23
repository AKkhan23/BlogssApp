//  "use client";

// import { useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { useAuth } from '@/hooks/useAuth';
// import { Button } from '@/components/ui/Button';
// import { Input } from '@/components/ui/Input';
// import toast from 'react-hot-toast';

// export default function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const { login } = useAuth();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const redirect = searchParams.get('redirect') ?? '/dashboard';

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     try {
//       await login(email, password);
//       toast.success('Welcome back! 👋');
//       router.push(redirect);
//       router.refresh();
//     } catch (error: unknown) {
//       toast.error(error instanceof Error ? error.message : 'Login failed');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-[80vh] flex items-center justify-center py-12">
//       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 w-full max-w-md">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <span className="text-5xl block mb-3">🔐</span>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//             Welcome Back
//           </h1>
//           <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
//             Sign in to continue to BlogApp
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <Input
//             label="Email Address"
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="you@example.com"
//             required
//             autoComplete="email"
//           />

//           <Input
//             label="Password"
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="••••••••"
//             required
//             autoComplete="current-password"
//           />

//           <Button
//             type="submit"
//             isLoading={isLoading}
//             size="lg"
//             className="w-full mt-2"
//           >
//             Sign In
//           </Button>
//         </form>

//         <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
//           Don&apos;t have an account?{' '}
//           <Link
//             href="/signup"
//             className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
//           >
//             Create one
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back! 👋");
      router.push(redirect);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🔐</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Sign in to continue to BlogApp
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            isLoading={isLoading}
            size="lg"
            className="w-full mt-2"
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
