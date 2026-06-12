"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"

const content = {
  en: {
    title: "Privacy Policy",
    intro:
      "Your privacy is important to us. This Privacy Policy explains how the Stutter Detection Application collects, uses, and protects your data.",
    infoTitle: "Information We Collect",
    infoText:
      "We may collect audio recordings or speech samples uploaded by users solely for speech analysis and research purposes. No personally identifiable information is required.",
    useTitle: "Use of Information",
    useText:
      "Collected data is used only to analyze speech patterns, improve system accuracy, and support academic research.",
    securityTitle: "Data Security",
    securityText:
      "Reasonable security measures are implemented to protect uploaded data. We do not sell or share user data with third parties.",
    updateTitle: "Policy Updates",
    updateText:
      "This policy may be updated periodically. Continued use of the application implies acceptance of the revised policy."
  },
  hi: {
    title: "गोपनीयता नीति",
    intro:
      "आपकी गोपनीयता हमारे लिए महत्वपूर्ण है। यह नीति बताती है कि स्टटर डिटेक्शन एप्लिकेशन डेटा कैसे एकत्र और सुरक्षित करता है।",
    infoTitle: "हम कौन सी जानकारी एकत्र करते हैं",
    infoText:
      "हम केवल भाषण विश्लेषण और अनुसंधान के लिए ऑडियो रिकॉर्डिंग एकत्र करते हैं।",
    useTitle: "जानकारी का उपयोग",
    useText:
      "डेटा का उपयोग केवल भाषण पैटर्न विश्लेषण और सिस्टम सुधार के लिए किया जाता है।",
    securityTitle: "डेटा सुरक्षा",
    securityText:
      "डेटा की सुरक्षा के लिए उचित उपाय किए जाते हैं और किसी तीसरे पक्ष से साझा नहीं किया जाता।",
    updateTitle: "नीति अपडेट",
    updateText:
      "यह नीति समय-समय पर अपडेट की जा सकती है।"
  },
  mr: {
    title: "गोपनीयता धोरण",
    intro:
      "आपली गोपनीयता आमच्यासाठी महत्त्वाची आहे. हे धोरण डेटा कसा गोळा व संरक्षित केला जातो हे स्पष्ट करते.",
    infoTitle: "आम्ही कोणती माहिती गोळा करतो",
    infoText:
      "फक्त भाषण विश्लेषण व संशोधनासाठी ऑडिओ नमुने गोळा केले जातात.",
    useTitle: "माहितीचा वापर",
    useText:
      "डेटाचा वापर केवळ प्रणाली सुधारणा आणि संशोधनासाठी केला जातो.",
    securityTitle: "डेटा सुरक्षा",
    securityText:
      "डेटा सुरक्षित ठेवण्यासाठी योग्य उपाययोजना केल्या जातात.",
    updateTitle: "धोरण अद्यतने",
    updateText:
      "हे धोरण वेळोवेळी अद्यतनित केले जाऊ शकते."
  }
}

export default function Privacy() {
  const { language } = useLanguage()
  const t = content[language]

  return (
    <div className="flex justify-center pt-24 pb-16 px-4">
      <motion.div
        className="max-w-4xl w-full space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold gradient-text text-center">
          {t.title}
        </h1>

        <Card className="bg-card border-border shadow-lg">
          <CardContent className="space-y-4 p-6 text-muted-foreground text-sm">
            <p>{t.intro}</p>

            <h2 className="text-lg font-semibold text-foreground">{t.infoTitle}</h2>
            <p>{t.infoText}</p>

            <h2 className="text-lg font-semibold text-foreground">{t.useTitle}</h2>
            <p>{t.useText}</p>

            <h2 className="text-lg font-semibold text-foreground">{t.securityTitle}</h2>
            <p>{t.securityText}</p>

            <h2 className="text-lg font-semibold text-foreground">{t.updateTitle}</h2>
            <p>{t.updateText}</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
