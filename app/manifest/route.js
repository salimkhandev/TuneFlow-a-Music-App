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
      // Android icons
      {
        src: "/icons/AppImages/android/android-launchericon-48-48.png",
        sizes: "48x48",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/AppImages/android/android-launchericon-72-72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/AppImages/android/android-launchericon-96-96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/AppImages/android/android-launchericon-144-144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/AppImages/android/android-launchericon-192-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/AppImages/android/android-launchericon-512-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      },
      // iOS icons
      {
        src: "/icons/AppImages/ios/16.png",
        sizes: "16x16",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/20.png",
        sizes: "20x20",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/29.png",
        sizes: "29x29",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/32.png",
        sizes: "32x32",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/40.png",
        sizes: "40x40",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/50.png",
        sizes: "50x50",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/57.png",
        sizes: "57x57",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/58.png",
        sizes: "58x58",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/60.png",
        sizes: "60x60",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/64.png",
        sizes: "64x64",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/72.png",
        sizes: "72x72",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/76.png",
        sizes: "76x76",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/80.png",
        sizes: "80x80",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/87.png",
        sizes: "87x87",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/100.png",
        sizes: "100x100",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/114.png",
        sizes: "114x114",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/120.png",
        sizes: "120x120",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/128.png",
        sizes: "128x128",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/144.png",
        sizes: "144x144",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/152.png",
        sizes: "152x152",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/167.png",
        sizes: "167x167",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/180.png",
        sizes: "180x180",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/256.png",
        sizes: "256x256",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/icons/AppImages/ios/1024.png",
        sizes: "1024x1024",
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
