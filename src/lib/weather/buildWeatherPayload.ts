// lib/weather/buildWeatherPayload.ts
import { WeatherFormType } from "./weather-schema";

export async function buildWeatherPayload(form: WeatherFormType) {
  const payload = {
    claim_id: form.claim_id,
    address: form.address,
    gps: form.gps || "",
    dateOfLoss: form.dateOfLoss,
    peril: form.peril,
    mapPreview: form.mapPreview || false,
    options: {
      noaaSwath: form.toggles.noaaSwath || false,
      hailSizeRadius: form.toggles.hailSizeRadius || false,
      hailDensity: form.toggles.hailDensity || false,
      hailHardness: form.toggles.hailHardness || false,
      groundStrikes: form.toggles.groundStrikes || false,
      maxGust: form.toggles.maxGust || false,
      threeSecondGust: form.toggles.threeSecondGust || false,
      windDirection: form.toggles.windDirection || false,
      windDrivenRain: form.toggles.windDrivenRain || false,
      rain24: form.toggles.rain24 || false,
      rain72: form.toggles.rain72 || false,
      flashFlood: form.toggles.flashFlood || false,
      radarLoop: form.toggles.radarLoop || false,
      freezeThaw: form.toggles.freezeThaw || false,
      snowLoad: form.toggles.snowLoad || false,
      iceIndex: form.toggles.iceIndex || false,
      stormSeverity: form.toggles.stormSeverity || false,
      stormTimeline: form.toggles.stormTimeline || false,
      codeCompare: form.toggles.codeCompare || false,
      cocorahs: form.toggles.cocorahs || false,
    },
  };

  return payload;
}
