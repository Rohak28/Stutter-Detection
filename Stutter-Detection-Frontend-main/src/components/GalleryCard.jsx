"use client"
import { motion } from "framer-motion"

const GalleryCard = ({ title, content, image, imagePosition = "left", icon: Icon, color = "blue" }) => {
  const gradientMap = {
    blue: "from-blue-50 to-indigo-50 border-blue-200",
    purple: "from-purple-50 to-pink-50 border-purple-200",
    green: "from-green-50 to-teal-50 border-green-200",
    orange: "from-orange-50 to-amber-50 border-orange-200",
  }

  const gradient = gradientMap[color] || gradientMap.blue

  return (
    <motion.div
      className="min-w-[90%] md:min-w-[80%] lg:min-w-[70%] xl:min-w-[60%] snap-center flex-shrink-0 mx-4 first:ml-0 last:mr-0"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`bg-gradient-to-br ${gradient} rounded-xl shadow-lg overflow-hidden border`}>
        <div className={`flex flex-col ${imagePosition === "right" ? "md:flex-row-reverse" : "md:flex-row"}`}>
          {image && (
            <div className="md:w-2/5 overflow-hidden">
              <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className={`p-6 md:p-8 ${image ? "md:w-3/5" : "w-full"}`}>
            {title && (
              <h3 className="text-2xl font-bold mb-4 flex items-center text-gray-800">
                {Icon && <Icon className="mr-2 h-6 w-6 text-primary" />}
                {title}
              </h3>
            )}

            <div className="prose prose-sm md:prose-base text-gray-700 max-w-none">{content}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default GalleryCard

