import { Info, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, property_address, latitude, longitude, roof_material")
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (data) setProperties(data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const mapboxToken =
      (process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string | undefined) ||
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!mapboxToken || !mapContainer.current || properties.length === 0) {
      if (!mapboxToken) setMapError("Mapbox token not configured. Showing list view instead.");
      return;
    }

    // Dynamic import of mapbox-gl
    import("mapbox-gl")
      .then((mapboxgl) => {
        mapboxgl.default.accessToken = mapboxToken;

        const map = new mapboxgl.default.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/light-v11",
          center:
            properties.length > 0
              ? [properties[0].longitude, properties[0].latitude]
              : [-104.9903, 39.7392],
          zoom: 10,
        });

        map.addControl(new mapboxgl.default.NavigationControl(), "top-right");

        properties.forEach((prop) => {
          new mapboxgl.default.Marker({ color: "#1e40af" })
            .setLngLat([prop.longitude, prop.latitude])
            .setPopup(
              new mapboxgl.default.Popup().setHTML(
                `<div class="p-2"><strong>${prop.property_address}</strong><br/>Material: ${
                  prop.roof_material || "Unknown"
                }</div>`
              )
            )
            .addTo(map);
        });

        return () => map.remove();
      })
      .catch((err) => {
        setMapError("Failed to load map. Showing list view instead.");
        console.error(err);
      });
  }, [properties]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Map</h1>
        <p className="text-muted-foreground">
          View and manage property pins with damage assessments
        </p>
      </div>

      {mapError ? (
        <Card className="p-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Info className="h-5 w-5" />
            <div className="text-sm">
              {mapError}
              <div className="mt-1 text-xs">
                To enable interactive map, set NEXT_PUBLIC_MAPBOX_TOKEN in your environment
                variables. Get your token at{" "}
                <a
                  href="https://mapbox.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="relative">
          <div
            ref={mapContainer}
            className="h-[500px] w-full rounded-xl border border-border shadow-lg"
          />
        </div>
      )}

      <div>
        <h2 className="mb-4 text-xl font-semibold">Properties</h2>
        {loading ? (
          <Card>
            <CardContent className="p-6">Loading properties...</CardContent>
          </Card>
        ) : properties.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">No properties with location data yet.</p>
              <Button className="mt-4" onClick={() => navigate("/lead/new")}>
                Create First Lead
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {properties.map((prop) => (
              <Card key={prop.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <div className="text-lg font-medium">{prop.property_address}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {prop.roof_material && `Material: ${prop.roof_material}`}
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => navigate(`/report-workbench?leadId=${prop.id}`)}>
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
