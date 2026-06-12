"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"

const terms = {
  en: {
    title: "Terms & Conditions",
    intro:
      "By accessing or using the Stutter Detection Application, you agree to the following terms and conditions.",
    purposeTitle: "Purpose of the Application",
    purposeText:
      "This application is intended for educational and research purposes only and does not provide medical diagnoses.",
    userTitle: "User Responsibility",
    userText:
      "Users must ensure uploaded data is lawful and appropriate. Misuse is prohibited.",
    liabilityTitle: "Limitation of Liability",
    liabilityText:
      "Developers are not liable for decisions made based on system output.",
    changesTitle: "Changes to Terms",
    changesText:
      "Terms may be updated without prior notice."
  },
  hi: {
    title: "नियम और शर्तें",
    intro:
      "इस एप्लिकेशन का उपयोग करके आप निम्नलिखित नियमों से सहमत होते हैं।",
    purposeTitle: "एप्लिकेशन का उद्देश्य",
    purposeText:
      "यह केवल शैक्षणिक और अनुसंधान उद्देश्यों के लिए है।",
    userTitle: "उपयोगकर्ता की जिम्मेदारी",
    userText:
      "उपयोगकर्ता यह सुनिश्चित करेंगे कि अपलोड किया गया डेटा वैध हो।",
    liabilityTitle: "उत्तरदायित्व की सीमा",
    liabilityText:
      "आउटपुट के आधार पर लिए गए निर्णयों के लिए डेवलपर जिम्मेदार नहीं हैं।",
    changesTitle: "नियमों में परिवर्तन",
    changesText:
      "नियमों को बिना सूचना बदला जा सकता है।"
  },
  mr: {
    title: "अटी व शर्ती",
    intro:
      "या अनुप्रयोगाचा वापर करून आपण खालील अटी मान्य करता.",
    purposeTitle: "अनुप्रयोगाचा उद्देश",
    purposeText:
      "हा अनुप्रयोग केवळ शैक्षणिक व संशोधनासाठी आहे.",
    userTitle: "वापरकर्त्याची जबाबदारी",
    userText:
      "अपलोड केलेला डेटा वैध असल्याची जबाबदारी वापरकर्त्याची आहे.",
    liabilityTitle: "जबाबदारीची मर्यादा",
    liabilityText:
      "निर्णयांबाबत विकसक जबाबदार नाहीत.",
    changesTitle: "अटींमधील बदल",
    changesText:
      "अटी पूर्वसूचनेशिवाय बदलल्या जाऊ शकतात."
  }
}

export default function Terms() {
  const { language } = useLanguage()
  const t = terms[language]

  return (
    <div className="flex justify-center pt-24 pb-16 px-4">
      <motion.div className="max-w-4xl w-full space-y-6">
        <h1 className="text-4xl font-extrabold gradient-text text-center">
          {t.title}
        </h1>

        <Card className="bg-card border-border shadow-lg">
          <CardContent className="space-y-4 p-6 text-muted-foreground text-sm">
            <p>{t.intro}</p>

            <h2 className="text-lg font-semibold text-foreground">{t.purposeTitle}</h2>
            <p>{t.purposeText}</p>

            <h2 className="text-lg font-semibold text-foreground">{t.userTitle}</h2>
            <p>{t.userText}</p>

            <h2 className="text-lg font-semibold text-foreground">{t.liabilityTitle}</h2>
            <p>{t.liabilityText}</p>

            <h2 className="text-lg font-semibold text-foreground">{t.changesTitle}</h2>
            <p>{t.changesText}</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
