"use client"

import { motion } from "framer-motion"
import { Mail, MapPin, Phone } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const contactText = {
  en: {
    heading: "Contact Us",
    subtitle: "Have questions or feedback? We’d love to hear from you.",
    support: "Available during academic working hours",
    institution: "VIIT, Pune, India",
    response: "We typically respond within 24–48 hours."
  },
  hi: {
    heading: "संपर्क करें",
    subtitle: "कोई प्रश्न या सुझाव? हमसे संपर्क करें।",
    support: "शैक्षणिक कार्य समय में उपलब्ध",
    institution: "वीआईआईटी, पुणे, भारत",
    response: "हम 24–48 घंटे में उत्तर देते हैं।"
  },
  mr: {
    heading: "संपर्क साधा",
    subtitle: "काही प्रश्न किंवा अभिप्राय? आमच्याशी संपर्क करा.",
    support: "शैक्षणिक वेळेत उपलब्ध",
    institution: "VIIT, पुणे, भारत",
    response: "आम्ही 24–48 तासांत उत्तर देतो."
  }
}

const ContactCard = ({ icon: Icon, title, content, delay }) => (
  <motion.div className="bg-card rounded-lg p-6 border shadow-md text-center">
    <Icon className="h-10 w-10 text-primary mx-auto mb-4" />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{content}</p>
  </motion.div>
)

export default function Contact() {
  const { language } = useLanguage()
  const t = contactText[language]

  return (
    <div className="flex flex-col items-center pt-24 pb-16 px-4 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold gradient-text">{t.heading}</h1>
        <p className="mt-4 text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <ContactCard icon={Mail} title="Email" content="rohak.stutteranalysis@gmail.com" />
        <ContactCard icon={Phone} title="Support" content={t.support} />
        <ContactCard icon={MapPin} title="Institution" content={t.institution} />
      </div>

      <p className="text-sm text-muted-foreground">{t.response}</p>
    </div>
  )
}
