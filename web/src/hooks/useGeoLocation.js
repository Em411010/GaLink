import { useState, useEffect, useCallback } from "react";
import { userAPI } from "../services/api";
import useAuthStore from "../store/useAuthStore";

// Philippines bounding box (lat: 4–22, lng: 115–130)
function isInPhilippines(lat, lng) {
  return lat >= 4 && lat <= 22 && lng >= 115 && lng <= 130;
}

// Browser Geolocation API → returns { lat, lng } or null
function browserGeolocate() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
}

// Reverse geocode lat/lng → formatted address via Nominatim
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      { headers: { "User-Agent": "GaLink/1.0" } }
    );
    const data = await res.json();
    if (!data.address) return null;
    const a = data.address;
    const country = a.country || "";
    const city = a.city || a.town || a.municipality || a.village || "";
    const state = a.state || a.region || a.province || "";
    if (/philippines/i.test(country)) {
      if (city && state) return `${city}, ${state}, Philippines`;
      if (city) return `${city}, Philippines`;
      if (state) return `${state}, Philippines`;
    }
    if (city && state && country) return `${city}, ${state}, ${country}`;
    if (city && country) return `${city}, ${country}`;
    return country || null;
  } catch {
    return null;
  }
}

export default function useGeoLocation() {
  const { user, updateUser } = useAuthStore();
  const [locationString, setLocationString] = useState(user?.location || "");
  const [loading, setLoading] = useState(false);

  // Auto-detect only if no location saved, only accept PH coords
  const requestLocation = useCallback(async () => {
    if (user?.location) {
      setLocationString(user.location);
      return; // Don't overwrite manually set location
    }
    setLoading(true);
    try {
      const coords = await browserGeolocate();
      if (coords && isInPhilippines(coords.lat, coords.lng)) {
        const address = await reverseGeocode(coords.lat, coords.lng);
        if (address) {
          setLocationString(address);
          const res = await userAPI.updateLocation({
            lat: coords.lat,
            lng: coords.lng,
            address,
          });
          updateUser({ ...user, location: res.data.location });
        }
      }
    } catch {
      // silent — keep existing location
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Manual override — saves to backend (backend geocodes the address to get real coords)
  const setManualLocation = useCallback(async (address) => {
    setLocationString(address);
    try {
      const res = await userAPI.updateLocation({ lat: 0, lng: 0, address });
      updateUser({ ...user, location: res.data.location });
    } catch {
      // keep the local value even if save fails
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Force refresh — re-detect via browser GPS, only accept PH coords
  const refreshLocation = useCallback(async () => {
    setLoading(true);
    try {
      const coords = await browserGeolocate();
      if (coords && isInPhilippines(coords.lat, coords.lng)) {
        const address = await reverseGeocode(coords.lat, coords.lng);
        if (address) {
          setLocationString(address);
          const res = await userAPI.updateLocation({
            lat: coords.lat,
            lng: coords.lng,
            address,
          });
          updateUser({ ...user, location: res.data.location });
          return address;
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
    return null;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    requestLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { locationString, loading, setManualLocation, refreshLocation };
}
