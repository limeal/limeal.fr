/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['firebasestorage.googleapis.com'],
    },
    env: {
        // Only whether the key exists reaches the browser, never the key itself
        NEXT_PUBLIC_RECRUITER_CHAT_ENABLED: process.env.OPENAI_API_KEY ? "true" : "false",
    },
}

module.exports = nextConfig
