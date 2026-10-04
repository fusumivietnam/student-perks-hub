export const dynamic = "force-dynamic";

export function GET() {
  if (process.env.VERCEL_ENV !== "preview") {
    return new Response("Not found", {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  throw new Error("controlled observability probe");
}
