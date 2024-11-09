"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="text-center py-10 bg-gradient-to-b from-green-500 to-blue-500 text-white w-full">
        <h1 className="text-4xl font-bold mb-4">Welcome to Leaf-N-Go</h1>
        <p className="text-lg mb-6">
          Plan, pack, and adventure sustainably.
        </p>
        <Link href="/checklists">
          <Button className="bg-white text-green-600 px-6 py-2 rounded-md font-semibold hover:bg-green-100">
            Get Started
          </Button>
        </Link>
      </section>

      
      {/* Footer */}
      <footer className="w-full py-6 bg-gray-800 text-white text-center">
        <p>&copy; {new Date().getFullYear()} Leaf-N-Go. Adventure Responsibly.</p>
      </footer>
    </div>
  );
}
