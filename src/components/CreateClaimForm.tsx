"use client";

import { Camera, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ClaimPhotoUpload } from "@/components/uploads/ClaimPhotoUpload";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface CreateClaimFormProps {
  onSuccess?: () => void;
  preselectedContactId?: string;
  preselectedPropertyId?: string;
  leadId?: string;
}

export default function CreateClaimForm({
  onSuccess,
  preselectedContactId,
  preselectedPropertyId,
  leadId,
}: CreateClaimFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [createNewContact, setCreateNewContact] = useState(false);
  const [createNewProperty, setCreateNewProperty] = useState(false);
  // Photo upload step after claim creation
  const [createdClaimId, setCreatedClaimId] = useState<string | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [photosUploaded, setPhotosUploaded] = useState(false);
  const [aiEstimate, setAiEstimate] = useState<{
    value: string;
    confidence: number;
    breakdown: any;
  } | null>(null);
  const [loadingAiEstimate, setLoadingAiEstimate] = useState(false);

  const [formData, setFormData] = useState({
    claimNumber: "",
    contact_id: preselectedContactId || "",
    property_id: preselectedPropertyId || "",
    insuranceCompany: "",
    dateOfLoss: "",
    typeOfLoss: "",
    description: "",
    estimatedValue: "",
    status: "NEW" as const,

    // New contact fields (if creating)
    newContactFirstName: "",
    newContactLastName: "",
    newContactEmail: "",
    newContactPhone: "",

    // New property fields (if creating)
    newPropertyAddress: "",
    newPropertyCity: "",
    newPropertyState: "",
    newPropertyZip: "",
  });

  useEffect(() => {
    // Load contacts and properties
    const loadData = async () => {
      try {
        const [contactsRes, propertiesRes] = await Promise.all([
          fetch("/api/contacts"),
          fetch("/api/properties"),
        ]);

        if (contactsRes.ok) {
          const contactsData = await contactsRes.json();
          console.log("[CreateClaimForm] Loaded contacts:", contactsData);
          setContacts(Array.isArray(contactsData) ? contactsData : []);
        } else {
          console.error("[CreateClaimForm] Failed to load contacts:", contactsRes.status);
        }

        if (propertiesRes.ok) {
          const propertiesData = await propertiesRes.json();
          console.log("[CreateClaimForm] Loaded properties:", propertiesData);
          setProperties(Array.isArray(propertiesData) ? propertiesData : []);
        } else {
          console.error("[CreateClaimForm] Failed to load properties:", propertiesRes.status);
        }

        // If leadId is provided, fetch lead data and pre-populate form
        if (leadId) {
          const leadRes = await fetch(`/api/leads/${leadId}`);
          if (leadRes.ok) {
            const leadData = await leadRes.json();
            console.log("[CreateClaimForm] Converting lead:", leadData);
            if (leadData.lead) {
              setFormData((prev) => ({
                ...prev,
                description: leadData.lead.description || "",
                contact_id: leadData.lead.contactId || "",
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load contacts and properties");
      }
    };

    loadData();
  }, [leadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convert dateOfLoss to ISO string for API
      const dateOfLossISO = formData.dateOfLoss
        ? new Date(formData.dateOfLoss).toISOString()
        : undefined;

      const payload = {
        claimNumber: formData.claimNumber,
        // API expects contactId not contact_id
        contactId: createNewContact ? undefined : formData.contact_id,
        // API expects propertyId not property_id
        propertyId: createNewProperty ? undefined : formData.property_id,
        insuranceCompany: formData.insuranceCompany,
        dateOfLoss: dateOfLossISO,
        typeOfLoss: formData.typeOfLoss,
        description: formData.description,
        estimatedValue: formData.estimatedValue ? parseInt(formData.estimatedValue, 10) : undefined,
        status: formData.status,

        // Include new contact/property data if creating
        ...(createNewContact && {
          newContact: {
            firstName: formData.newContactFirstName,
            lastName: formData.newContactLastName,
            email: formData.newContactEmail,
            phone: formData.newContactPhone,
          },
        }),

        ...(createNewProperty && {
          newProperty: {
            street: formData.newPropertyAddress,
            city: formData.newPropertyCity,
            state: formData.newPropertyState,
            zipCode: formData.newPropertyZip,
          },
        }),
      };

      const response = await fetch("/api/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create claim");
      }

      const claim = await response.json();
      console.log("[CreateClaimForm] Claim created:", claim);
      toast.success("Claim created successfully! Add inspection photos now.");

      if (claim?.id) {
        // Show photo upload step instead of navigating immediately
        setCreatedClaimId(claim.id);
        setShowPhotoUpload(true);
      } else if (onSuccess) {
        onSuccess();
      } else {
        toast.error("Claim created but could not get ID - please refresh");
        router.push("/claims");
        router.refresh();
      }
    } catch (error) {
      console.error("Error creating claim:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create claim");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle photo upload complete
  const handlePhotoUploadComplete = (urls: string[]) => {
    if (urls.length > 0) {
      setPhotosUploaded(true);
      toast.success(`${urls.length} inspection photo(s) uploaded!`);
    }
  };

  // Navigate to claim workspace
  const goToClaimWorkspace = () => {
    if (createdClaimId) {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/claims/${createdClaimId}`);
        router.refresh();
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Trigger AI estimate when relevant fields change
    if (["typeOfLoss", "dateOfLoss", "property_id", "newPropertyAddress"].includes(field)) {
      fetchAiEstimate();
    }
  };

  const fetchAiEstimate = async () => {
    // Only fetch if we have minimum required data
    if (!formData.typeOfLoss) return;

    setLoadingAiEstimate(true);
    try {
      const propertyAddress = formData.property_id
        ? properties.find((p) => p.id === formData.property_id)?.address
        : formData.newPropertyAddress;

      const response = await fetch("/api/ai/estimate-value", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          damageType: formData.typeOfLoss,
          propertyAddress,
          dateOfLoss: formData.dateOfLoss,
          propertyType: "Single Family", // Default for now
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiEstimate({
          value: data.estimatedValueFormatted,
          confidence: data.confidence,
          breakdown: data.breakdown,
        });
      }
    } catch (error) {
      console.error("Failed to fetch AI estimate:", error);
    } finally {
      setLoadingAiEstimate(false);
    }
  };

  // Show photo upload step after claim is created
  if (showPhotoUpload && createdClaimId) {
    return (
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-green-700 dark:text-green-400">Claim Created!</CardTitle>
              <p className="text-sm text-muted-foreground">
                Now add inspection photos to complete your claim
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Upload Section */}
          <div className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Upload Inspection Photos</h3>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Add photos of the damage for AI analysis and report generation. You can also add more
              photos later from the claim workspace.
            </p>
            <ClaimPhotoUpload
              claimId={createdClaimId}
              onUploadComplete={handlePhotoUploadComplete}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={goToClaimWorkspace}
              className="order-2 sm:order-1"
            >
              {photosUploaded ? "Continue to Claim" : "Skip Photos"}
            </Button>
            <Button
              type="button"
              onClick={goToClaimWorkspace}
              className="order-1 sm:order-2"
              disabled={!photosUploaded}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {photosUploaded ? "Open Claim Workspace" : "Upload Photos First"}
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-center text-xs text-muted-foreground">
            Claim #{formData.claimNumber} has been saved. You can always add more photos from the
            Photos tab in your claim workspace.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>Create New Claim</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Claim Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Claim Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="claimNumber">Claim Number *</Label>
                <Input
                  id="claimNumber"
                  required
                  value={formData.claimNumber}
                  onChange={(e) => handleInputChange("claimNumber", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="insuranceCompany">Insurance Company *</Label>
                <Input
                  id="insuranceCompany"
                  required
                  value={formData.insuranceCompany}
                  onChange={(e) => handleInputChange("insuranceCompany", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="dateOfLoss">Date of Loss *</Label>
                <Input
                  id="dateOfLoss"
                  type="date"
                  required
                  value={formData.dateOfLoss}
                  onChange={(e) => handleInputChange("dateOfLoss", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="typeOfLoss">Type of Loss *</Label>
                <Select onValueChange={(value) => handleInputChange("typeOfLoss", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type of loss" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIRE">Fire</SelectItem>
                    <SelectItem value="WATER">Water</SelectItem>
                    <SelectItem value="STORM">Storm/Wind</SelectItem>
                    <SelectItem value="HAIL">Hail</SelectItem>
                    <SelectItem value="THEFT">Theft/Vandalism</SelectItem>
                    <SelectItem value="LIABILITY">Liability</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estimatedValue">Estimated Value (USD)</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="22500"
                  value={formData.estimatedValue}
                  onChange={(e) => handleInputChange("estimatedValue", e.target.value)}
                />
                {aiEstimate && (
                  <button
                    type="button"
                    onClick={() => {
                      const numericValue = aiEstimate.value.replace(/[^0-9.]/g, "");
                      handleInputChange("estimatedValue", numericValue);
                      toast.success("AI estimate applied");
                    }}
                    className="mt-2 w-full cursor-pointer rounded-md border border-blue-200 bg-blue-50 p-2 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        🤖 AI Estimate: {aiEstimate.value}
                      </span>
                      <span className="text-xs text-blue-700 dark:text-blue-300">
                        {aiEstimate.confidence}% confidence
                      </span>
                    </div>
                    <p className="mt-1 text-left text-xs text-blue-600 dark:text-blue-400">
                      Click to use this estimate • Based on {formData.typeOfLoss} damage patterns
                    </p>
                  </button>
                )}
                {loadingAiEstimate && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    🔄 Calculating AI estimate...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">Contact</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createNewContact"
                  checked={createNewContact}
                  onCheckedChange={(checked) => setCreateNewContact(checked === true)}
                />
                <Label htmlFor="createNewContact" className="text-sm">
                  Create new contact
                </Label>
              </div>
            </div>

            {createNewContact ? (
              <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="newContactFirstName">First Name *</Label>
                  <Input
                    id="newContactFirstName"
                    required
                    value={formData.newContactFirstName}
                    onChange={(e) => handleInputChange("newContactFirstName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="newContactLastName">Last Name *</Label>
                  <Input
                    id="newContactLastName"
                    required
                    value={formData.newContactLastName}
                    onChange={(e) => handleInputChange("newContactLastName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="newContactEmail">Email</Label>
                  <Input
                    id="newContactEmail"
                    type="email"
                    value={formData.newContactEmail}
                    onChange={(e) => handleInputChange("newContactEmail", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="newContactPhone">Phone</Label>
                  <Input
                    id="newContactPhone"
                    type="tel"
                    value={formData.newContactPhone}
                    onChange={(e) => handleInputChange("newContactPhone", e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="contactId">Select Contact *</Label>
                <Select
                  value={formData.contact_id}
                  onValueChange={(value) => handleInputChange("contact_id", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName} ({contact.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Property Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">Property</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createNewProperty"
                  checked={createNewProperty}
                  onCheckedChange={(checked) => setCreateNewProperty(checked === true)}
                />
                <Label htmlFor="createNewProperty" className="text-sm">
                  Create new property
                </Label>
              </div>
            </div>

            {createNewProperty ? (
              <div className="space-y-4 rounded-lg border p-4">
                <div>
                  <Label htmlFor="newPropertyAddress">Property Address *</Label>
                  <Input
                    id="newPropertyAddress"
                    required
                    value={formData.newPropertyAddress}
                    onChange={(e) => handleInputChange("newPropertyAddress", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="newPropertyCity">City *</Label>
                    <Input
                      id="newPropertyCity"
                      required
                      value={formData.newPropertyCity}
                      onChange={(e) => handleInputChange("newPropertyCity", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPropertyState">State *</Label>
                    <Input
                      id="newPropertyState"
                      required
                      value={formData.newPropertyState}
                      onChange={(e) => handleInputChange("newPropertyState", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPropertyZip">ZIP Code *</Label>
                    <Input
                      id="newPropertyZip"
                      required
                      value={formData.newPropertyZip}
                      onChange={(e) => handleInputChange("newPropertyZip", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="propertyId">Select Property *</Label>
                <Select
                  value={formData.property_id}
                  onValueChange={(value) => handleInputChange("property_id", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.address}, {property.city}, {property.state} {property.zipCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Description</h3>
            <div>
              <Label htmlFor="description">Claim Description *</Label>
              <Textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the damage and circumstances of the loss..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Claim"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
