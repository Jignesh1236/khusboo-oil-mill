import { useState } from "react";
import { useLocation } from "wouter";
import { useOnboardUser } from "@/lib/api-client-react";
import { useStoreUser } from "@/hooks/use-store-user";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  ArrowForward,
  Person,
  LocationOn,
  Phone,
  Favorite,
  CheckCircle,
  Store,
} from "@mui/icons-material";

const SOURCE_OPTIONS = [
  { value: "instagram", label: "Instagram", emoji: "📸" },
  { value: "facebook", label: "Facebook", emoji: "👥" },
  { value: "friend", label: "Friend / Family", emoji: "🤝" },
  { value: "search", label: "Google / Search", emoji: "🔍" },
  { value: "whatsapp", label: "WhatsApp", emoji: "💬" },
  { value: "other", label: "Other", emoji: "✨" },
];

const STEPS = [
  { id: "name", title: "What's your name?", subtitle: "We'll use this to personalise your experience.", Icon: Person },
  { id: "source", title: "How did you find us?", subtitle: "We'd love to know where you came from.", Icon: Favorite },
  { id: "phone", title: "Your phone number", subtitle: "Used for order updates. Completely optional.", Icon: Phone },
  { id: "address", title: "Your delivery address", subtitle: "Save time at checkout. You can skip this.", Icon: LocationOn },
  { id: "terms", title: "Almost there!", subtitle: "Just one last thing before you start shopping.", Icon: CheckCircle },
];

const variants = {
  enter: (d: number) => ({ opacity: 0, x: d * 60, scale: 0.97 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (d: number) => ({ opacity: 0, x: d * -60, scale: 0.97 }),
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
  const { Icon: StepIcon } = currentStep;

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

  const skipLabel = step === 2 ? (formData.phone ? "Continue" : "Skip for now") : step === 3 ? (formData.address ? "Continue" : "Skip for now") : null;

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#0f0f14",
        position: "relative",
        overflow: "hidden",
        px: 2,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -120,
          left: -120,
          width: 400,
          height: 400,
          borderRadius: "50%",
          bgcolor: "rgba(249,115,22,0.15)",
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -100,
          right: -100,
          width: 350,
          height: 350,
          borderRadius: "50%",
          bgcolor: "rgba(139,92,246,0.12)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 6, opacity: 0.7 }}>
        <Store sx={{ color: "#f97316", fontSize: 20 }} />
        <Typography
          variant="caption"
          sx={{ color: "#fff", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}
        >
          MyStore
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 5 }}>
        {STEPS.map((_, i) => (
          <Box
            key={i}
            component="button"
            onClick={() => { if (i < step) { setDirection(-1); setStep(i); } }}
            sx={{
              transition: "all 0.3s",
              borderRadius: 99,
              border: "none",
              cursor: i < step ? "pointer" : "default",
              bgcolor:
                i === step ? "#f97316" : i < step ? "rgba(249,115,22,0.5)" : "rgba(255,255,255,0.12)",
              width: i === step ? 24 : 8,
              height: 8,
              p: 0,
            }}
          />
        ))}
      </Box>

      <Box sx={{ width: "100%", maxWidth: 440, position: "relative" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Box
              sx={{
                bgcolor: "#1a1a24",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 4,
                p: 4,
                boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  bgcolor: "rgba(249,115,22,0.12)",
                  border: "1px solid rgba(249,115,22,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <StepIcon sx={{ color: "#f97316", fontSize: 22 }} />
              </Box>

              <Typography variant="h5" fontWeight={700} sx={{ color: "#fff", mb: 0.5 }}>
                {currentStep.title}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.45)", mb: 3.5 }}>
                {currentStep.subtitle}
              </Typography>

              {step === 0 && (
                <TextField
                  autoFocus
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && goNext()}
                  fullWidth
                  inputProps={{ "data-testid": "input-name" }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(255,255,255,0.05)",
                      color: "#fff",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                      "&.Mui-focused fieldset": { borderColor: "#f97316" },
                    },
                    "& input::placeholder": { color: "rgba(255,255,255,0.3)", opacity: 1 },
                  }}
                />
              )}

              {step === 1 && (
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                  {SOURCE_OPTIONS.map((opt) => (
                    <Box
                      key={opt.value}
                      component="button"
                      onClick={() => setFormData((p) => ({ ...p, source: opt.value }))}
                      data-testid={`option-source-${opt.value}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor:
                          formData.source === opt.value
                            ? "#f97316"
                            : "rgba(255,255,255,0.1)",
                        bgcolor:
                          formData.source === opt.value
                            ? "rgba(249,115,22,0.18)"
                            : "rgba(255,255,255,0.04)",
                        color: formData.source === opt.value ? "#fff" : "rgba(255,255,255,0.65)",
                        cursor: "pointer",
                        transition: "all 0.18s",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: 18, lineHeight: 1 }}>{opt.emoji}</span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>{opt.label}</span>
                    </Box>
                  ))}
                </Box>
              )}

              {step === 2 && (
                <TextField
                  autoFocus
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && goNext()}
                  fullWidth
                  inputProps={{ "data-testid": "input-phone" }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(255,255,255,0.05)",
                      color: "#fff",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                      "&.Mui-focused fieldset": { borderColor: "#f97316" },
                    },
                    "& input::placeholder": { color: "rgba(255,255,255,0.3)", opacity: 1 },
                  }}
                />
              )}

              {step === 3 && (
                <TextField
                  autoFocus
                  multiline
                  rows={3}
                  placeholder="e.g. 12, Gandhi Nagar, Vadodara - 390001"
                  value={formData.address}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                  fullWidth
                  inputProps={{ "data-testid": "input-address" }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(255,255,255,0.05)",
                      color: "#fff",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                      "&.Mui-focused fieldset": { borderColor: "#f97316" },
                    },
                    "& textarea::placeholder": { color: "rgba(255,255,255,0.3)", opacity: 1 },
                  }}
                />
              )}

              {step === 4 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Box
                    sx={{
                      bgcolor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    {[
                      { label: "Name", value: formData.name },
                      { label: "Source", value: SOURCE_OPTIONS.find((o) => o.value === formData.source)?.label || "" },
                      ...(formData.phone ? [{ label: "Phone", value: formData.phone }] : []),
                      ...(formData.address ? [{ label: "Address", value: formData.address }] : []),
                    ].map((item) => (
                      <Box key={item.label} sx={{ display: "flex", gap: 2, mb: 1 }}>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.35)", minWidth: 56 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <FormControlLabel
                    data-testid="checkbox-terms"
                    control={
                      <Checkbox
                        checked={formData.termsAccepted}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, termsAccepted: e.target.checked }))
                        }
                        sx={{
                          color: "rgba(255,255,255,0.2)",
                          "&.Mui-checked": { color: "#f97316" },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                        I agree to the{" "}
                        <a
                          href="/terms-of-service"
                          target="_blank"
                          style={{ color: "#f97316", textDecoration: "underline" }}
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="/privacy-policy"
                          target="_blank"
                          style={{ color: "#f97316", textDecoration: "underline" }}
                        >
                          Privacy Policy
                        </a>
                      </Typography>
                    }
                  />
                </Box>
              )}

              <Box sx={{ display: "flex", gap: 1.5, mt: 4 }}>
                {step > 0 && (
                  <Button
                    onClick={goBack}
                    data-testid="button-back"
                    sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.05)" } }}
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={goNext}
                  disabled={!canProceed() || loading}
                  data-testid="button-continue"
                  variant="contained"
                  endIcon={loading ? <CircularProgress size={16} sx={{ color: "rgba(255,255,255,0.8)" }} /> : step < STEPS.length - 1 ? <ArrowForward /> : null}
                  sx={{
                    flex: 1,
                    bgcolor: "#f97316",
                    "&:hover": { bgcolor: "#ea580c" },
                    "&.Mui-disabled": { bgcolor: "rgba(249,115,22,0.3)", color: "rgba(255,255,255,0.4)" },
                    py: 1.5,
                    fontWeight: 700,
                  }}
                >
                  {loading ? "Setting up..." : step === STEPS.length - 1 ? "Start Shopping" : skipLabel || "Continue"}
                </Button>
              </Box>
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>

      <Typography
        variant="caption"
        sx={{ color: "rgba(255,255,255,0.2)", mt: 4 }}
      >
        Step {step + 1} of {STEPS.length}
      </Typography>
    </Box>
  );
}
