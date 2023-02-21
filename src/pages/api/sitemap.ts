import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/db/client";
import { env } from "../../env/server.mjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-control", "stale-while-revalidate, s-maxage=3600");

  const staticUrls = [
    getSitemapEntry("", new Date()),
    getSitemapEntry("/", new Date()),
    getSitemapEntry("/thanks", new Date()),
  ];
  const spots = await prisma.spot.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  });
  const spotUrls = spots.map((spot) =>
    getSitemapEntry(`/spots/${spot.id}`, spot.updatedAt)
  );
  const wings = await prisma.wing.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  });
  const wingUrls = wings.map((wing) =>
    getSitemapEntry(`/wings/${wing.id}`, wing.updatedAt)
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticUrls.join("\n")}
    ${spotUrls.join("\n")}
    ${wingUrls.join("\n")}
    </urlset>
  `;

  res.end(xml);
}

const getSitemapEntry = (path: string, lastmod: Date) => {
  return `
    <url>
      <loc>${env.NEXT_PUBLIC_BASE_URL}${path}</loc>
      <lastmod>${lastmod.toISOString().split("T")[0]}</lastmod>
    </url>
  `;
};
