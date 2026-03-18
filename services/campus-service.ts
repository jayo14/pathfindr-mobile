import AsyncStorage from "@react-native-async-storage/async-storage";

import { campusBuildings, campusEvents, lostItemReports } from "@/mocks/campus";
import { isSupabaseConfigured, supabase } from "@/services/supabase";
import {
    Building,
    CachedCampusData,
    CampusEvent,
    LostItemReport,
} from "@/types/domain";

const CAMPUS_CACHE_KEY = "pathfindr-campus-cache";
const LOST_FOUND_STORAGE_KEY = "pathfindr-local-lost-found";

async function readCachedCampusData(): Promise<CachedCampusData | null> {
  const rawCache = await AsyncStorage.getItem(CAMPUS_CACHE_KEY);

  if (!rawCache) {
    return null;
  }

  try {
    return JSON.parse(rawCache) as CachedCampusData;
  } catch (error) {
    console.log("PathFindr cache parse error", error);
    return null;
  }
}

async function writeCachedCampusData(data: CachedCampusData): Promise<void> {
  await AsyncStorage.setItem(CAMPUS_CACHE_KEY, JSON.stringify(data));
}

async function loadBuildingsFromSupabase(): Promise<Building[]> {
  if (!supabase) {
    return campusBuildings;
  }

  const { data, error } = await supabase.from("buildings").select("*");

  if (error || !data) {
    console.log("PathFindr buildings fallback", error);
    return campusBuildings;
  }

  return data as Building[];
}

async function loadEventsFromSupabase(): Promise<CampusEvent[]> {
  if (!supabase) {
    return campusEvents;
  }

  const { data, error } = await supabase.from("events").select("*");

  if (error || !data) {
    console.log("PathFindr events fallback", error);
    return campusEvents;
  }

  return data as CampusEvent[];
}

async function loadLostItemsFromSupabase(): Promise<LostItemReport[]> {
  if (!supabase) {
    return lostItemReports;
  }

  const { data, error } = await supabase.from("lost_items").select("*");

  if (error || !data) {
    console.log("PathFindr lost items fallback", error);
    return lostItemReports;
  }

  return data as LostItemReport[];
}

export async function getCampusData(): Promise<CachedCampusData> {
  const cached = await readCachedCampusData();

  try {
    const [buildings, events, lostItems] = await Promise.all([
      loadBuildingsFromSupabase(),
      loadEventsFromSupabase(),
      loadLostItemsFromSupabase(),
    ]);

    const mergedLostItems = await getLostAndFoundReports(lostItems);
    const nextData: CachedCampusData = {
      buildings,
      events,
      lostItems: mergedLostItems,
      updatedAt: new Date().toISOString(),
    };

    await writeCachedCampusData(nextData);
    console.log("PathFindr campus data refreshed", {
      buildings: nextData.buildings.length,
      events: nextData.events.length,
      lostItems: nextData.lostItems.length,
      supabase: isSupabaseConfigured,
    });

    return nextData;
  } catch (error) {
    console.log("PathFindr campus data fallback to cache", error);

    if (cached) {
      return cached;
    }

    return {
      buildings: campusBuildings,
      events: campusEvents,
      lostItems: await getLostAndFoundReports(lostItemReports),
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function getLostAndFoundReports(
  seedReports: LostItemReport[] = lostItemReports,
): Promise<LostItemReport[]> {
  const rawLocalReports = await AsyncStorage.getItem(LOST_FOUND_STORAGE_KEY);

  if (!rawLocalReports) {
    return seedReports;
  }

  try {
    const localReports = JSON.parse(rawLocalReports) as LostItemReport[];
    return [...localReports, ...seedReports];
  } catch (error) {
    console.log("PathFindr lost report parse error", error);
    return seedReports;
  }
}

export async function submitLostAndFoundReport(
  report: LostItemReport,
): Promise<LostItemReport> {
  const existing = await getLostAndFoundReports([]);
  const nextReports = [report, ...existing];

  await AsyncStorage.setItem(
    LOST_FOUND_STORAGE_KEY,
    JSON.stringify(nextReports),
  );

  if (supabase) {
    const { error } = await supabase.from("lost_items").insert(report);

    if (error) {
      console.log("PathFindr lost item sync skipped", error);
    }
  }

  return report;
}
