// Screenshot of a website's landing page, through Microlink's public API
// (CORS-enabled, no key; the free plan is rate limited to a few captures per day).
export const captureWebsite = async (url: string): Promise<File> => {
    const api = new URL("https://api.microlink.io/");
    api.search = new URLSearchParams({
        url,
        screenshot: "true",
        meta: "false",
        embed: "screenshot.url",
        "screenshot.type": "jpeg",
        "viewport.width": "1440",
        "viewport.height": "900",
    }).toString();

    const res = await fetch(api);
    if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) {
        throw new Error(res.status === 429 ? "Screenshot quota reached, try again later" : "Screenshot failed");
    }

    const blob = await res.blob();
    return new File([blob], `screenshot-${Date.now()}.jpg`, { type: blob.type });
};
