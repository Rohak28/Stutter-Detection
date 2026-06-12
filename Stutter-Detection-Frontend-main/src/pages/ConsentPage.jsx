import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * ConsentPage Component
 * Displays mandatory consent form for audio/video recording
 * Prevents analysis from starting until user agrees to all T&C
 */
export function ConsentPage({ onAccept, onCancel }) {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(false);

  const handleProceed = () => {
    if (agreed) {
      onAccept();
    } else {
      setError(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: 0.1 },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm z-50"
      >
        <motion.div
          variants={contentVariants}
          className="w-full max-w-2xl"
        >
          <Card className="border-2 border-blue-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
              <CardTitle className="flex items-center gap-3 text-2xl text-blue-900">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <ShieldCheck className="h-7 w-7 text-blue-600" />
                </motion.div>
                Patient Consent & Privacy Agreement
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-8 space-y-6">
              {/* Consent Terms */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4 max-h-96 overflow-y-auto pr-4"
              >
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Data Collection</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        By proceeding with this analysis, you consent to the recording and processing of your 
                        <strong> audio and video</strong> data. This data is essential for the stutter detection 
                        algorithm to analyze speech patterns, facial movements, and other indicators of stuttering.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Purpose of Processing</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        The collected data will be used solely for the purpose of identifying stuttering events 
                        and providing a detailed analysis report. This information helps Speech-Language Pathologists (SLPs) 
                        in diagnosis and treatment planning.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Privacy & Security</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        We prioritize your privacy. Your recordings are processed securely. We do not share your 
                        identifiable data with third parties without your explicit consent, except as required by law.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Voluntary Participation</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Your participation is entirely voluntary. You may stop the recording or withdraw from the 
                        analysis at any time before submission.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Data Retention</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Your data will be retained for the duration of your treatment and analysis. You have the right 
                        to request deletion of your data at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Checkbox Agreement */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <input
                  type="checkbox"
                  id="consent-checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (e.target.checked) setError(false);
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer mt-0.5 accent-blue-600"
                />
                <label
                  htmlFor="consent-checkbox"
                  className="text-sm font-medium text-gray-900 cursor-pointer flex-1"
                >
                  I have read and fully understand the terms and conditions. I consent to the recording and processing 
                  of my audio and video data for stutter detection analysis.
                </label>
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">
                      You must agree to the terms and conditions to proceed.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3 pt-4"
              >
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProceed}
                  disabled={!agreed}
                  className={`flex-1 transition-all duration-300 ${
                    agreed
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {agreed ? "Accept & Start Analysis" : "Accept to Continue"}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ConsentPage;
