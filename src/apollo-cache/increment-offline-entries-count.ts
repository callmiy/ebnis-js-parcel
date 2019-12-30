import immer from "immer";
import { queryCacheOfflineItems } from "../state/resolvers/get-experiences-from-cache";
import { OFFLINE_ITEMS_TYPENAME } from "../state/offline-resolvers";
import { isOfflineId } from "../constants";
import { writeOfflineItemsToCache } from "./write-offline-items-to-cache";
import { InMemoryCache } from "apollo-cache-inmemory";

export function incrementOfflineEntriesCountForExperience(
  cache: InMemoryCache,
  experienceId: string,
) {
  let cacheData = queryCacheOfflineItems(cache);

  if (cacheData.length === 0) {
    cacheData = [newOfflineExperienceInCache(experienceId)];
  } else {
    cacheData = immer(cacheData, proxy => {
      let index = 0;
      let len = proxy.length;
      let experienceFound = false;

      for (; index < len; index++) {
        const experience = proxy[index];

        if (experience.id === experienceId) {
          ++experience.offlineEntriesCount;
          experienceFound = true;
          break;
        }
      }

      if (!experienceFound) {
        proxy.push(newOfflineExperienceInCache(experienceId));
      }
    });
  }

  writeOfflineItemsToCache(cache, cacheData);
}

export function newOfflineExperienceInCache(experienceId: string) {
  return {
    id: experienceId,
    offlineEntriesCount: isOfflineId(experienceId) ? 0 : 1,
    __typename: OFFLINE_ITEMS_TYPENAME,
  };
}