export async function GET() {
  const manifest = {
    name: "TuneFlow - Music App",
    short_name: "TuneFlow",
    description: "A responsive music application for streaming and discovering music",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#1a1a1a",
    orientation: "portrait",
    scope: "/",
    categories: ["music", "entertainment"],
    lang: "en",
    dir: "ltr",
    icons: [
      {
        src: "/icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png"
      },
      {
        src: "/icons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png"
      },
      {
        src: "/icons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
