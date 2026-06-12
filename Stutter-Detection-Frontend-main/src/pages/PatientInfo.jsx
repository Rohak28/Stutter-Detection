import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  GraduationCap,
  Globe,
  ArrowLeft,
  Heart,
  Hash,
} from "lucide-react";

export default function PatientInfo() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const patient = state?.patient;

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <Card className="glass border-white/10 shadow-xl max-w-sm">
          <CardContent className="py-12 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="font-medium mb-2">No Patient Data</p>
            <p className="text-sm text-muted-foreground mb-6">
              Please select a patient from the analysis page.
            </p>
            <Button onClick={() => navigate(-1)} variant="outline" className="glass border-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const infoItems = [
    { icon: Hash, label: "Patient ID", value: patient.patientId || "N/A" },
    { icon: User, label: "Full Name", value: patient.name || "N/A" },
    { icon: Mail, label: "Email", value: patient.email || "N/A" },
    { icon: Calendar, label: "Date of Birth", value: patient.dob ? new Date(patient.dob).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "N/A" },
    { icon: User, label: "Age", value: patient.age ? `${patient.age} years` : "N/A" },
    { icon: Heart, label: "Gender", value: patient.gender || "N/A" },
    { icon: GraduationCap, label: "Grade / Class", value: patient.grade || "N/A" },
    { icon: Globe, label: "Mother Tongue", value: patient.motherTongue || "N/A" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 p-4 md:p-8"
      >
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="mb-6 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Analyses
            </Button>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass border-white/10 shadow-xl backdrop-blur-xl overflow-hidden">
              {/* Header with avatar */}
              <div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-8 py-8 border-b border-white/5">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {patient.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold font-display">{patient.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-white/20">
                        {patient.patientId || "Patient"}
                      </Badge>
                      {patient.gender && (
                        <Badge className="bg-primary/15 text-primary border-primary/30 border text-xs capitalize">
                          {patient.gender}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Details */}
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {infoItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.04 }}
                      className="flex items-center gap-4 px-8 py-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-muted/20">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                        <p className="font-medium text-sm mt-0.5 capitalize">{item.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
