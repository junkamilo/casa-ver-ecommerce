import { deleteBunnyAssetsByUrls } from "@/lib/bunny-admin";

import { isBunnyCdnUrl } from "@/lib/media-url";



/** Elimina assets remotos en Bunny Storage según las URLs proporcionadas. */

export async function deleteMediaAssetsByUrls(urls: string[]): Promise<void> {

  const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];

  if (unique.length === 0) return;



  const bunnyUrls = unique.filter(isBunnyCdnUrl);

  await deleteBunnyAssetsByUrls(bunnyUrls);

}


