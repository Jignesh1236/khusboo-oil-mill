import { useState } from "react";
import { useLocation } from "wouter";
import { useOnboardUser } from "@workspace/api-client-react";
import { useStoreUser } from "@/hooks/use-store-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, User, MapPin, Phone, Heart, CheckCircle2, Store } from "lucide-react";

const SOURCE_OPTIONS = [
  { value: "instagram", label: "Instagram", emoji: "📸" },
  { value: "facebook", label: "Facebook", emoji: "👥" },
  { value: "friend", label: "Friend / Family", emoji: "🤝" },
  { value: "search", label: "Google / Search", emoji: "🔍" },
  { value: "whatsapp", label: "WhatsApp", emoji: "💬" },
  { value: "other", label: "Other", emoji: "✨" },
];

const STEPS = [
  { id: "name", title: "What's your name?", subtitle: "We'll use this to personalise your experience.", icon: User },
  { id: "source", title: "How did you find us?", subtitle: "We'd love to know where you came from.", icon: Heart },
  { id: "phone", title: "Your phone number", subtitle: "Used for order updates. Completely optional.", icon: Phone },
  { id: "address", title: "Your delivery address", subtitle: "Save time at checkout. You can skip this.", icon: MapPin },
  { id: "terms", title: "Almost there!", subtitle: "Just one last thing before you start shopping.", icon: CheckCircle2 },
];

const variants = {
  enter: { opacity: 0, x: 60, scale: 0.97 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -60, scale: 0.97 },
};

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { saveUser } = useStoreUser();
  const onboardUser = useOnboardUser();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    source: "",
    phone: "",
    address: "",
    termsAccepted: false,
  });

  const currentStep = STEPS[step];

  const canProceed = () => {
    if (step === 0) return formData.name.trim().length >= 2;
    if (step === 1) return formData.source !== "";
    if (step === 4) return formData.termsAccepted;
    return true;
  };

  const goNext = () => {
    if (!canProceed()) return;
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") goNext();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const { ip } = await ipRes.json();

      onboardUser.mutate(
        { data: { name: formData.name, source: formData.source, phone: formData.phone, address: formData.address, ip } },
        {
          onSuccess: (user) => {
            saveUser({ _id: user._id, name: user.name, ip: user.ip, address: user.address, phone: user.phone });
            setLocation("/");
          },
          onError: () => {
            toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
            setLoading(false);
          },
        }
      );
    } catch {
      setLoading(false);
      toast({ title: "Error", description: "Could not connect. Check your internet.", variant: "destructive" });
    }
  };

  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f14] relative overflow-hidden px-4">
      {/* Background blobs */}
      <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />

      {/* Store branding */}
      <div className="flex items-center gap-2 mb-10 text-white/80">
        <Store className="w-5 h-5 text-primary" />
        <span className="text-sm font-semibold tracking-wide uppercase">MyStore</span>
      </div>

      {/* Step dots */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => { if (i < step) { setDirection(-1); setStep(i); } }}
            className={`transition-all duration-300 rounded-full ${
              i === step
                ? "w-6 h-2 bg-primary"
                : i < step
                ? "w-2 h-2 bg-primary/50 cursor-pointer"
                : "w-2 h-2 bg-white/15"
            }`}
          />
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-md relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-[#1a1a24] border border-white/8 rounded-2xl p-8 shadow-2xl"
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 mb-6">
              <StepIcon className="w-5 h-5 text-primary" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-1">{currentStep.title}</h1>
            <p className="text-white/50 text-sm mb-7">{currentStep.subtitle}</p>

            {/* Step content */}
            {step === 0 && (
              <Input
                autoFocus
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                onKeyDown={handleKeyDown}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary h-12 text-base"
                data-testid="input-name"
              />
            )}

            {step === 1 && (
              <div className="grid grid-cols-2 gap-2">
                {SOURCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormData((p) => ({ ...p, source: opt.value }))}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                      formData.source === opt.value
                        ? "bg-primary/20 border-primary text-white"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/8 hover:text-white"
                    }`}
                    data-testid={`option-source-${opt.value}`}
                  >
                    <span className="text-lg leading-none">{opt.emoji}</span>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <Input
                autoFocus
                type="tel"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                onKeyDown={handleKeyDown}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary h-12 text-base"
                data-testid="input-phone"
              />
            )}

            {step === 3 && (
              <Textarea
                autoFocus
                placeholder="e.g. 12, Gandhi Nagar, Vadodara - 390001"
                value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary text-base resize-none"
                rows={3}
                data-testid="input-address"
              />
            )}

            {step === 4 && (
              <div className="space-y-5">
                {/* Summary */}
                <div className="bg-white/5 border border-white/8 rounded-xl p-4 space-y-2 text-sm">
                  {(
                    [
                      { label: "Name", value: formData.name },
                      { label: "Source", value: SOURCE_OPTIONS.find((o) => o.value === formData.source)?.label ?? "" },
                      ...(formData.phone ? [{ label: "Phone", value: formData.phone }] : []),
                      ...(formData.address ? [{ label: "Address", value: formData.address }] : []),
                    ] as { label: string; value: string }[]
                  ).map((item) => (
                    <div key={item.label} className="flex gap-2">
                      <span className="text-white/40 w-16 shrink-0">{item.label}</span>
                      <span className="text-white/80 font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer group" data-testid="checkbox-terms">
                  <Checkbox
                    checked={formData.termsAccepted}
                    onCheckedChange={(c) => setFormData((p) => ({ ...p, termsAccepted: !!c }))}
                    className="mt-0.5 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors leading-snug">
                    I agree to the{" "}
                    <a href="/terms-of-service" className="text-primary underline underline-offset-2" target="_blank">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy-policy" className="text-primary underline underline-offset-2" target="_blank">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-7">
              {step > 0 && (
                <Button
                  variant="ghost"
                  onClick={goBack}
                  className="text-white/50 hover:text-white hover:bg-white/5"
                  data-testid="button-back"
                >
                  Back
                </Button>
              )}

              <Button
                onClick={goNext}
                disabled={!canProceed() || loading}
                className="flex-1 h-11 font-semibold gap-2 bg-primary hover:bg-primary/90 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                data-testid="button-continue"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up...
                  </span>
                ) : step === 4 ? (
                  "Start Shopping"
                ) : step === 2 || step === 3 ? (
                  <>
                    {formData[step === 2 ? "phone" : "address"] ? "Continue" : "Skip for now"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step counter */}
      <p className="text-white/25 text-xs mt-6">
        Step {step + 1} of {STEPS.length}
      </p>
    </div>
  );
}
