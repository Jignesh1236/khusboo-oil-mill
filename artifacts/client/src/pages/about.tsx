import { useGetConfig } from "@/lib/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from "lucide-react";

export default function About() {
  const { data: config, isLoading } = useGetConfig();

  if (isLoading) {
    return (
      <div className="space-y-8 pb-20">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-10 max-w-3xl mx-auto space-y-12">
      {/* About Section */}
      <section className="text-center space-y-4">
        {config?.logoUrl ? (
          <img src={config.logoUrl} alt="Store Logo" className="h-24 w-auto mx-auto mb-6 object-contain" />
        ) : null}
        <h1 className="text-4xl font-bold">{config?.storeName || "About Us"}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
          {config?.aboutUs || "Welcome to our store. We provide the best quality products for you."}
        </p>
      </section>

      {/* Contact & Info Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border bg-card p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-bold">Contact Info</h2>
          <div className="space-y-4">
            {config?.contactAddress && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{config.contactAddress}</span>
              </div>
            )}
            {config?.contactPhone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground">{config.contactPhone}</span>
              </div>
            )}
            {config?.contactEmail && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground">{config.contactEmail}</span>
              </div>
            )}
          </div>

          {(config?.instagramUrl || config?.facebookUrl) && (
            <div className="pt-4 border-t">
              <h3 className="font-bold mb-3">Follow Us</h3>
              <div className="flex gap-4">
                {config?.instagramUrl && (
                  <a href={config.instagramUrl} target="_blank" rel="noreferrer" className="bg-muted p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {config?.facebookUrl && (
                  <a href={config.facebookUrl} target="_blank" rel="noreferrer" className="bg-muted p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border bg-card p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-bold">Store Timings</h2>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">{config?.storeTimingDays || "Monday - Saturday"}</p>
              <p className="text-muted-foreground">
                {config?.storeTimingOpen || "09:00 AM"} - {config?.storeTimingClose || "08:00 PM"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Map Embed */}
      {config?.mapEmbedUrl && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Location</h2>
          <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden border bg-muted">
            <iframe 
              src={config.mapEmbedUrl} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Store Location Map"
            />
          </div>
        </section>
      )}
    </div>
  );
}
