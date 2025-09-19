export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const name = (searchParams.get("name") || "song").replace(/[^a-z0-9-_\. ]/gi, "_");

    if (!url) {
      return new Response("Missing url query param", { status: 400 });
    }

    const upstream = await fetch(url);
    if (!upstream.ok || !upstream.body) {
      return new Response("Failed to fetch source", { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "audio/mpeg";
    const contentLength = upstream.headers.get("content-length");

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `attachment; filename="${name}.mp3"`);
    if (contentLength) headers.set("Content-Length", contentLength);

    // Stream response to client
    return new Response(upstream.body, { headers });
  } catch (error) {
    return new Response("Unexpected error", { status: 500 });
  }
}


