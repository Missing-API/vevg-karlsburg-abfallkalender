// Next.js 15+ rendert GET-Route-Handler standardmäßig dynamisch; force-static behält das statische Verhalten von Next.js 14 bei.
export const dynamic = "force-static";

export async function GET() {
  const info: object = {
    communityList: {
      uri: "/api/communities",
      description: "List of all communities with proper data.",
    },
    communityItem: {
      uriTemplate: "/api/communities/:id",
      description: "Single community with proper data.",
    },
    completeSchedule: {
      uri: "/api/schedule",
      description:
        "Complete schedule for all communities and waste types. Attention: this will lead to a multi-megabyte download.",
    },
    wasteTypeSchedule: {
      uriTemplate: "/api/schedule/:wasteType",
      description: "Schedule for a single waste type for all communities.",
      uriList: {
        restmuell: "/api/schedule/restmuell",
        altpapier: "/api/schedule/altpapier",
        gelbersack: "/api/schedule/gelbersack",
        schadstoffe: "/api/schedule/schadstoffe",
        weihnachtsbaeume: "/api/schedule/weihnachtsbaeume",
      },
    },
  };

  const communityInfo: object = {
    uri: "/api/communities",
  };

  return Response.json(info);
}
