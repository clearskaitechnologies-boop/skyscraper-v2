import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate,useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const leadFormSchema = z.object({
  address: z
    .string()
    .trim()
    .min(1, "Address is required")
    .max(200, "Address must be less than 200 characters"),
  leadType: z.enum(["retail", "insurance", "inspection"], {
    required_error: "Please select a lead type",
  }),
});

export default function LeadNew() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof leadFormSchema>>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      address: sp.get("address") ?? "",
      leadType: (sp.get("leadType") as "retail" | "insurance" | "inspection") ?? "retail",
    },
  });

  const handleSubmit = (values: z.infer<typeof leadFormSchema>) => {
    if (values.leadType === "retail") navigate(`/retail/build?leadId=new`);
    if (values.leadType === "insurance") navigate(`/insurance/build?leadId=new`);
    if (values.leadType === "inspection") navigate(`/inspection-guided?leadId=new`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pb-16 pt-24">
        <div className="mx-auto max-w-lg space-y-6 px-4">
          <h1 className="text-3xl font-bold text-foreground">Create Lead</h1>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4 rounded-xl border border-border bg-card p-6"
            >
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="leadType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
                      >
                        <option value="retail">Retail Proposal</option>
                        <option value="insurance">Insurance-Ready Folder</option>
                        <option value="inspection">Hands-on Inspection (AI Guided)</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="mt-6 w-full">
                Continue
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
