import { getCommunityList } from "../../../src/communities/getCommunityList";
import { VevgCommunity } from "../../../src/vevg.types";

// Next.js 15+ rendert GET-Route-Handler standardmäßig dynamisch; force-static behält das statische Verhalten von Next.js 14 bei.
export const dynamic = "force-static";
export const maxDuration = 30;

export async function GET() {
  let vevgCommunityList: VevgCommunity[] = await getCommunityList();
  return Response.json({
    results: vevgCommunityList.length,
    communities: vevgCommunityList,
  });
}
