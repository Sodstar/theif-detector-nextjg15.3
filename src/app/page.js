"use client"
import { useState } from "react";
import ObjectDetection from "@/components/object-detection";

export default function Home() {
  const [showCamera, setShowCamera] = useState(true);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 tracking-tight">
            Объект илрүүлэх AI систем.
          </h1>
          <p className="mt-3 text-xl text-gray-300 max-w-3xl mx-auto">
            Дүрс таних технологи ашиглан камерийн тусламжтайгаар аюул тарих магадлалтай эд зүйлсийг илрүүлж, аюулгүй байдлыг хангах зорилготой.
          </p>

          <div className="mt-6">
            <button
              onClick={() => setShowCamera(!showCamera)}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full text-white font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center mx-auto"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {showCamera ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                )}
              </svg>
              {showCamera ? "Hide Camera" : "Show Camera"}
            </button>
          </div>
        </div>

        {showCamera && <ObjectDetection />}
      </div>
    </main>
  );
}
