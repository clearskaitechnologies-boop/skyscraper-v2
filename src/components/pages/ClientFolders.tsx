import { Download, FileText, Filter,Search } from "lucide-react";
import { useEffect,useState } from "react";

import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ClientFolders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get folders from storage
      const { data: folderData, error: folderError } = await supabase.storage
        .from("folders")
        .list(user.id);

      if (folderError) throw folderError;

      // Get associated lead data
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id);

      if (leadsError) throw leadsError;

      // Combine folder and lead data
      const combinedData = (folderData || []).map((folder) => {
        const lead = leadsData?.find((l) => folder.name.includes(l.id));
        return {
          id: folder.id,
          name: folder.name,
          propertyAddress: lead?.property_address || "Unknown",
          ownerName: lead?.client_name || "Unknown",
          status: lead?.status || "pending",
          proposalDate: folder.created_at,
          files: [],
        };
      });

      setFolders(combinedData);
    } catch (error: any) {
      console.error("Error loading folders:", error);
      toast({
        title: "Error loading folders",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadFolder = async (folderId: string) => {
    toast({
      title: "Downloading...",
      description: "Your folder is being prepared",
    });
    // Implementation would zip and download all files
  };

  const mockFolders = [
    {
      id: 1,
      propertyAddress: "1234 Maple Street, Denver, CO 80202",
      ownerName: "John Smith",
      status: "Approved",
      proposalDate: "2024-01-15",
      files: ["Proposal.pdf", "Inspection_Photos.zip", "Weather_Report.pdf"],
    },
    {
      id: 2,
      propertyAddress: "5678 Oak Avenue, Denver, CO 80203",
      ownerName: "Sarah Johnson",
      status: "Pending",
      proposalDate: "2024-01-18",
      files: ["Proposal.pdf", "Damage_Analysis.pdf"],
    },
    {
      id: 3,
      propertyAddress: "9012 Pine Road, Denver, CO 80204",
      ownerName: "Michael Davis",
      status: "Sent",
      proposalDate: "2024-01-20",
      files: ["Proposal.pdf", "Claims_Ready_Folder.zip"],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-success text-success-foreground";
      case "Pending":
        return "bg-warning text-warning-foreground";
      case "Sent":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Client Folders</h1>
          <p className="text-muted-foreground">
            View and manage all claims-ready folders and client proposals
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search by address or owner name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <p className="py-8 text-center text-muted-foreground">Loading folders...</p>
          ) : folders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No folders found. Create claims-ready folders from the Insurance Build page.
            </p>
          ) : (
            <>
              {folders.map((folder) => (
                <Card key={folder.id} className="transition-colors hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{folder.propertyAddress}</CardTitle>
                        <CardDescription className="mt-1">
                          Owner: {folder.ownerName} • Created:{" "}
                          {new Date(folder.proposalDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(folder.status)}>{folder.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{folder.files.length} files</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="bg-accent text-accent-foreground hover:bg-accent/90"
                          onClick={() => downloadFolder(folder.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download All
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {folder.files.map((file, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientFolders;
