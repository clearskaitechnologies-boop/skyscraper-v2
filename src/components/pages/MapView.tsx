import { Filter, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";

import MapboxMap from "@/components/MapboxMap";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const MapView = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (error) throw error;

      const formattedProperties = (data || []).map((lead) => ({
        id: lead.id,
        address: lead.property_address,
        lat: Number(lead.latitude),
        lon: Number(lead.longitude),
        status:
          lead.status === "won"
            ? "High Risk"
            : lead.status === "proposal_sent"
              ? "Medium Risk"
              : "Low Risk",
        damage: Math.floor(Math.random() * 100), // Replace with actual damage calculation
      }));

      setProperties(formattedProperties);
    } catch (error) {
      console.error("Error loading properties:", error);
      // Show empty state instead of mock data
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sidebar - Property List */}
          <div className="space-y-4 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>{properties.length} properties tracked</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="space-y-2">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{property.address}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Damage: {property.damage}%
                          </p>
                        </div>
                        <Badge
                          variant={
                            property.status === "High Risk"
                              ? "destructive"
                              : property.status === "Medium Risk"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {property.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {property.lat.toFixed(4)}, {property.lon.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Risk Level</label>
                  <div className="space-y-2">
                    {["All", "High Risk", "Medium Risk", "Low Risk"].map((level) => (
                      <label key={level} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded"
                          defaultChecked={level === "All"}
                        />
                        <span className="text-sm">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Damage %</label>
                  <div className="space-y-2">
                    {["0-25%", "26-50%", "51-75%", "76-100%"].map((range) => (
                      <label key={range} className="flex cursor-pointer items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">{range}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-180px)]">
              <CardContent className="relative h-full p-0">
                {loading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <p className="text-muted-foreground">Loading map...</p>
                  </div>
                ) : (
                  <MapboxMap properties={properties as any} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapView;
