/** @type {import('next').NextConfig} */
const nextConfig = {
    // Lets a verification build (NEXT_DIST_DIR=.next-check) run next to `next dev`
    // without overwriting its files
    distDir: process.env.NEXT_DIST_DIR || '.next',
    // Articles are read from disk at request time: ship them with the functions
    outputFileTracingIncludes: {
        '/articles/**/*': ['./content/articles/**/*'],
        '/sitemap.xml': ['./content/articles/**/*'],
    },
    images: {
        remotePatterns: [{ protocol: 'https', hostname: 'firebasestorage.googleapis.com' }],
    },
    env: {
        // Only whether the key exists reaches the browser, never the key itself
        NEXT_PUBLIC_RECRUITER_CHAT_ENABLED: process.env.OPENAI_API_KEY ? "true" : "false",
    },
}

module.exports = nextConfig
