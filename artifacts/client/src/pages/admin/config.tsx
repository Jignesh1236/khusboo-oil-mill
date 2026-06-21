import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useGetConfig, useUpdateConfig, type StoreConfigInput } from "@/lib/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/image-uploader";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminConfig() {
  const { data: config, isLoading } = useGetConfig();
  const updateConfigMutation = useUpdateConfig();

  const form = useForm<StoreConfigInput>({
    defaultValues: {
      storeName: "",
      logoUrl: "",
      whatsappNumber: "",
      currencySymbol: "₹",
      deliveryCharge: 0,
      freeDeliveryAbove: 0,
      storeTimingOpen: "",
      storeTimingClose: "",
      storeTimingDays: "",
      instagramUrl: "",
      facebookUrl: "",
      aboutUs: "",
      contactPhone: "",
      contactEmail: "",
      contactAddress: "",
      mapEmbedUrl: "",
      adminPin: ""
    }
  });

  useEffect(() => {
    if (config) {
      form.reset({
        storeName: config.storeName || "",
        logoUrl: config.logoUrl || "",
        whatsappNumber: config.whatsappNumber || "",
        currencySymbol: config.currencySymbol || "₹",
        deliveryCharge: config.deliveryCharge || 0,
        freeDeliveryAbove: config.freeDeliveryAbove || 0,
        storeTimingOpen: config.storeTimingOpen || "",
        storeTimingClose: config.storeTimingClose || "",
        storeTimingDays: config.storeTimingDays || "",
        instagramUrl: config.instagramUrl || "",
        facebookUrl: config.facebookUrl || "",
        aboutUs: config.aboutUs || "",
        contactPhone: config.contactPhone || "",
        contactEmail: config.contactEmail || "",
        contactAddress: config.contactAddress || "",
        mapEmbedUrl: config.mapEmbedUrl || "",
        adminPin: "" // Don't show existing pin
      });
    }
  }, [config, form]);

  const onSubmit = (data: StoreConfigInput) => {
    // If adminPin is empty string, don't send it so it doesn't overwrite
    const payload = { ...data };
    if (!payload.adminPin) {
      delete payload.adminPin;
    }

    updateConfigMutation.mutate(
      { data: payload },
      {
        onSuccess: () => {
          toast({ title: "Settings saved successfully" });
        },
        onError: () => {
          toast({ title: "Failed to save settings", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground">Manage your store details, contact info, and operational rules.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* General Info */}
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Logo</FormLabel>
                    <FormControl>
                      <ImageUploader value={field.value} onChange={field.onChange} folder="store-logo" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aboutUs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Us</FormLabel>
                    <FormControl><Textarea rows={4} {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Commerce */}
          <Card>
            <CardHeader>
              <CardTitle>Commerce & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormDescription>Format: CountryCode + Number (e.g. 919876543210)</FormDescription>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currencySymbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency Symbol</FormLabel>
                    <FormDescription>Symbol shown before prices (e.g. ₹, $, €)</FormDescription>
                    <FormControl><Input maxLength={4} {...field} /></FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryCharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Delivery Charge</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="freeDeliveryAbove"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Free Delivery Threshold</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact & Location */}
          <Card>
            <CardHeader>
              <CardTitle>Contact & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input type="tel" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contactAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physical Address</FormLabel>
                    <FormControl><Textarea rows={2} {...field} /></FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mapEmbedUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Maps Embed URL</FormLabel>
                    <FormDescription>Paste the src URL from Google Maps Embed iframe</FormDescription>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Operations & Social */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Store Timings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="storeTimingDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating Days</FormLabel>
                      <FormControl><Input placeholder="e.g. Monday - Saturday" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="storeTimingOpen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Open Time</FormLabel>
                        <FormControl><Input placeholder="09:00 AM" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="storeTimingClose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Close Time</FormLabel>
                        <FormControl><Input placeholder="08:00 PM" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="instagramUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram URL</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="facebookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook URL</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Security */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Security</CardTitle>
              <CardDescription>Update the admin PIN required to access this dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="adminPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Admin PIN</FormLabel>
                    <FormControl><Input type="password" placeholder="Leave blank to keep current PIN" {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end sticky bottom-4">
            <Button type="submit" size="lg" disabled={updateConfigMutation.isPending} className="shadow-lg">
              {updateConfigMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
