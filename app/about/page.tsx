"use client";

import InfoBox from "@/components/informationBox";
import { useAuth } from "@/lib/auth-Context";
import Link from "next/link";

const AboutPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-12">
            {/* Greeting Section */}
            {user && (
                <div className="mb-6 text-center">
                    <h2 className="text-xl font-semibold text-blue-600">
                        Hello, {user.email || "Adventurer"}!
                    </h2>
                    <p className="text-gray-600">Thanks for being a part of Leaf-N-Go.</p>
                </div>
            )}

            {/* Headline */}
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">
                    Plan Smarter. Adventure Better.
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                    Your ultimate tool for stress-free and sustainable outdoor adventures.
                </p>
                <InfoBox message={"We're currently in development and still working on things. All of the features listed here are not currently in the app. Thanks for checking us out!"} />
            </header>

            {/* Overview */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">What is Leaf-N-Go?</h2>
                <p className="text-gray-700 leading-relaxed">
                    Leaf-N-Go is the ultimate tool for outdoor adventurers, designed to simplify trip planning while keeping the environment in mind. Whether you&apos;re preparing for a weekend hike or a multi-day trek, we&apos;ve got you covered with customizable checklists, AI-powered insights, and tools to ensure you&apos;re ready for your journey.
                </p>
            </section>

            {/* Core Features */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Core Features</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Create and customize checklists tailored to your adventures.</li>
                    <li>Get insights into your environmental impact and plan more sustainably.</li>
                    <li>Access all your trip essentials in one mobile-friendly dashboard.</li>
                </ul>
            </section>

            {/* About the Creator */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Meet the Creator</h2>
                <p className="text-gray-700 leading-relaxed">
                    Hi, I&apos;m Kyle, a passionate outdoor enthusiast and software engineer. After countless adventures planning hikes, climbs, and backpacking trips, I realized the need for a tool to make trip preparation easier and more environmentally conscious. Leaf-N-Go is my way of helping fellow adventurers spend more time exploring and less time planning.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Give us Feedback</h2>
                <p className="text-gray-700 leading-relaxed">
                    Thanks for trying out the app! If you find any bugs or have any feedback we&apos;d be happy to hear from you! Send an <Link style={{ color: 'blue', textDecoration: "underline" }} href="mailto:feedback+kyle@czajkowski.tech">email</Link> over,
                    or submit an <Link style={{ color: 'blue', textDecoration: "underline" }} href="https://github.com/Kyle-Ski/leaf-n-go/issues">issue</Link> in the GitHub Repository.
                </p>
            </section>

            {/* Call to Action */}
            <section className="text-center mt-12">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Start Your Adventure</h2>
                <p className="text-gray-600 mb-6">
                    {user
                        ? "Head over to your checklists and start planning your next journey!"
                        : "Sign in to access all the tools and features of Leaf-N-Go."}
                </p>
                <a
                    href={user ? "/checklists" : "/auth?mode=signup"}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700"
                >
                    {user ? "Go to Checklists" : "Sign Up"}
                </a>
            </section>

        </div>
    );
};

export default AboutPage;
