import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(locale: string, dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals = {
    year: 365 * 24 * 60 * 60,
    month: 30 * 24 * 60 * 60,
    week: 7 * 24 * 60 * 60,
    day: 24 * 60 * 60,
    hour: 60 * 60,
    minute: 60,
    second: 1,
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) {
      return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

export function extractPostalAndCity(address: string): string | null {
  const regex = /(\d{5})\s+([A-Za-zÀ-ÖØ-öø-ÿ\s-]+)/;
  const match = address.match(regex);

  if (!match) return null;

  return `${match[1]} ${match[2].trim()}`;
}

export function getDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function chooseColor(ortType: string, status?: string) {
  if (ortType === "offer") {
    switch (status) {
      case "active":
        return "blue";

      case "in_progress":
        return "orange";

      case "completed":
        return "violet";

      case "cancelled":
        return "black";

      case "archived":
        return "grey";

      default:
        return "blue";
    }
  } else if (ortType === "request") {
    switch (status) {
      case "active":
        return "green";

      case "in_progress":
        return "orange";

      case "completed":
        return "violet";

      case "cancelled":
        return "black";

      case "archived":
        return "grey";

      default:
        return "green";
    }
  } else if (ortType === "alert") {
    switch (status) {
      case "active":
        return "red";

      case "in_progress":
        return "orange";

      case "completed":
        return "violet";

      case "cancelled":
        return "black";

      case "archived":
        return "grey";

      default:
        return "red";
    }
  }
  return "blue"; // fallback
}
