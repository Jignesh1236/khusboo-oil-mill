import { useGetConfig } from "@/lib/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function TermsOfService() {
  const { data: config, isLoading } = useGetConfig();

  if (isLoading) {
    return <div className="p-8 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-12 prose prose-sm md:prose-base dark:prose-invert">
      <Link href="/about" className="text-primary no-underline hover:underline mb-8 inline-block">&larr; Back to About</Link>
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <p>Please read these terms and conditions carefully before using Our Service.</p>
      
      <h2>Acknowledgment</h2>
      <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company ({config?.storeName || "Our Store"}). These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
      
      <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>

      <h2>Placing Orders for Goods</h2>
      <p>By placing an Order for Goods through the Service, You warrant that You are legally capable of entering into binding contracts.</p>
      
      <h3>Your Information</h3>
      <p>If You wish to place an Order for Goods available on the Service, You may be asked to supply certain information relevant to Your Order including, without limitation, Your Name, Your Email, Your Phone number, Your Credit Card number, the expiration date of Your Credit Card, Your Billing address, and Your Shipping information.</p>

      <h2>Contact Us</h2>
      <p>If you have any questions about these Terms and Conditions, You can contact us:</p>
      <ul>
        <li>By email: {config?.contactEmail || "contact@example.com"}</li>
        <li>By phone number: {config?.contactPhone || "+1 234 567 890"}</li>
      </ul>
    </div>
  );
}
