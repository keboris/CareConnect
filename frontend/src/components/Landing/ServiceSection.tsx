import { useLanguage } from "../../contexts"; // Import useLanguage for translations

const ServicesSection = () => {
  const { t } = useLanguage(); // Get translation function 't'

  const features = [
    {
      title: t("service.comprehensiveCare"), // Use translated title for 'Comprehensive Care'
      description: t("service.comprehensiveCareDesc"), // Use translated description for 'Comprehensive Care'
      image:
        "https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=800",
      gradient: "from-blue-500 via-blue-600 to-cyan-600",
    },
    {
      title: t("service.professionalTeam"), // Use translated title for 'Professional Team'
      description: t("service.professionalTeamDesc"), // Use translated description for 'Professional Team'
      image:
        "https://img1.wsimg.com/isteam/ip/862bb1bc-7a5a-4068-9cb2-70d54a165adc/picture%20(76).png",
      gradient: "from-emerald-500 via-green-600 to-teal-600",
    },
    {
      title: t("service.flexibleScheduling"), // Use translated title for 'Flexible Scheduling'
      description: t("service.flexibleSchedulingDesc"), // Use translated description for 'Flexible Scheduling'
      image:
        "https://www.amle.org/wp-content/uploads/2021/02/784784p888EDNmain1018Merenbloom_pic.jpg",
      gradient: "from-amber-500 via-orange-600 to-red-600",
    },
    {
      title: t("service.privacySecurity"), // Use translated title for 'Privacy & Security'
      description: t("service.privacySecurityDesc"), // Use translated description for 'Privacy & Security'
      image:
        "https://www.mydccu.com/learn/resources/blog/online-privacy/_jcr_content/root/teaser.coreimg.jpeg/1665599383709/2022-10-cybersecurity-awareness-month-blog-image.jpeg",
      gradient: "from-rose-500 via-pink-600 to-red-600",
    },
  ];

  return (
    <section className="py-20 px-6 sm:px-10 lg:px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent">
            {t("service.title")} {/* Translated section title */}
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {t("service.description")} {/* Translated section description */}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-2 duration-500 bg-white border border-gray-100"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
                  <h3 className="text-xl font-bold text-white">
                    {feature.title}
                  </h3>{" "}
                  {/* Display feature title */}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>{" "}
                {/* Display feature description */}
                <div className="relative mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out`}
                  ></div>{" "}
                  {/* Animated gradient bottom border */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
