const ORIGIN = "https://rodriacostadg.github.io";
const PREFIX = "/promos-parada-canga";
export default {
  async fetch(request) {
    if (!["GET", "HEAD"].includes(request.method)) {
      return new Response("Método no permitido", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    const incoming = new URL(request.url);
    const target = new URL(PREFIX + incoming.pathname + incoming.search, ORIGIN);
    if (!target.pathname.startsWith(PREFIX + "/")) return new Response("No encontrado", {status:404});
    const headers = new Headers();
    for (const name of ["accept", "if-none-match", "if-modified-since", "range", "if-range"]) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    try {
      const upstream = await fetch(target, { method: request.method, headers, redirect: "manual" });
      const response = new Response(upstream.body, upstream);
      const location = response.headers.get("Location");
      if (location) {
        const redirect = new URL(location, target);
        if (redirect.origin === ORIGIN && redirect.pathname.startsWith(PREFIX + "/")) {
          response.headers.set("Location", incoming.origin + redirect.pathname.slice(PREFIX.length) + redirect.search + redirect.hash);
        }
      }
      response.headers.delete("set-cookie");
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      response.headers.set("Cache-Control", "public, max-age=60");
      return response;
    } catch (error) {
      console.error(JSON.stringify({ event: "origin_unavailable", message: String(error) }));
      return new Response("El sitio no está disponible momentáneamente. Volvé a intentar en unos minutos.", {
        status: 502, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
      });
    }
  }
};
