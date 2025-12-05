import React from "react";
import { Link } from "react-router-dom";
import { Button, Card, SectionHeader } from "../components/UI";
import {
  ShoppingBag,
  DollarSign,
  Leaf,
  Sparkles,
  TrendingDown,
  Users,
  Clock,
  Star,
  Search,
  Filter,
  List,
  Map as MapIcon,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { ContainerScroll } from "../components/ui/container-scroll-animation";
import bagImage from "../assets/Untitled design (4).png";
import macaronsImage from "../assets/Untitled design (2).png";
import heroImage from "../assets/Gemini_Generated_Image_f2ur9gf2ur9gf2ur.png";
import { FloatingHoverEffect } from "../components/FloatingHoverEffect";
import { BackgroundGradient } from "../components/ui/background-gradient";

const Landing: React.FC = () => {
  // Mock Home Page Preview Component
  const HomePagePreview = () => (
    <div className="w-full h-full bg-white overflow-y-auto">
      {/* Search Bar */}
      <div className="bg-white p-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <div className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
              Search for bags, vendors...
            </div>
          </div>
          <button className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
            <Filter size={16} className="text-gray-600" />
          </button>
          <div className="border border-gray-200 rounded-lg flex overflow-hidden">
            <button className="px-3 py-2 bg-gray-100 text-xs font-medium">
              <List size={14} />
            </button>
            <button className="px-3 py-2 bg-white text-xs">
              <MapIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bag Cards Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="p-2.5">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] font-semibold text-gray-900 truncate">
                  Cafe Delight
                </div>
                <div className="flex items-center gap-0.5 bg-green-50 px-1 py-0.5 rounded text-[9px] font-bold text-green-700">
                  4.8 <Star size={8} className="fill-current" />
                </div>
              </div>
              <div className="flex items-center gap-1 mb-1">
                <div className="bg-primary-600 text-white text-[8px] px-1.5 py-0.5 rounded font-semibold">
                  60% off
                </div>
              </div>
              <div className="text-[9px] text-gray-500 mb-2 line-clamp-2">
                Surprise Bag with Pastries
              </div>
              <div className="flex items-center gap-1 text-[8px] text-gray-400 mb-2">
                <Clock size={8} />
                <span>5:00 PM - 7:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-primary-700">
                    $8.50
                  </div>
                  <div className="text-[9px] text-gray-400 line-through">
                    $21.00
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Section */}
      <div className="p-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">My Orders</h3>
        <div className="space-y-2">
          {[
            {
              vendor: "Bread & Butter Bakery",
              item: "Pastry Surprise",
              status: "Picked Up",
              date: "2 days ago",
            },
            {
              vendor: "Sushi Zen",
              item: "Sushi Platter Ends",
              status: "Reserved",
              date: "Today",
            },
          ].map((order, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-lg p-2.5 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-gray-900 truncate">
                    {order.item}
                  </div>
                  <div className="text-[9px] text-gray-500 truncate">
                    {order.vendor}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {order.status === "Picked Up" ? (
                    <CheckCircle size={12} className="text-green-600" />
                  ) : (
                    <Clock size={12} className="text-orange-600" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[8px] text-gray-400">{order.date}</span>
                <span
                  className={`text-[8px] font-medium ${
                    order.status === "Picked Up"
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Hero Section with Full-Width Image */}
      <motion.section
        className="relative w-full h-screen min-h-[600px] overflow-hidden m-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.img
          src={heroImage}
          alt="KiasuBites - Good food shouldn't go to waste"
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 35%" }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        {/* Fading gradient overlay at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
      </motion.section>

      {/* iPad Preview Section */}
      <div className="flex flex-col overflow-hidden mt-0 mb-0">
        <ContainerScroll
          titleComponent={
            <motion.div
              initial={{ opacity: 0.0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="relative flex flex-col gap-4 items-center justify-center px-4"
            >
              <h2 className="text-4xl md:text-5xl font-semibold text-black dark:text-white mb-4">
                Now available on{" "}
                <span className="text-4xl md:text-[5rem] font-bold mt-1 leading-none text-primary-600">
                  App Store
                </span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Experience KiasuBites on your device. Discover amazing deals and
                rescue delicious food with ease.
              </p>
            </motion.div>
          }
        >
          <HomePagePreview />
        </ContainerScroll>
      </div>

      {/* Stats Bar */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto pt-0 pb-16 md:pb-24"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Users, value: "1K+", label: "Active Users" },
            { icon: ShoppingBag, value: "5K+", label: "Bags Rescued" },
            { icon: TrendingDown, value: "70%", label: "Average Savings" },
            { icon: Leaf, value: "2.5T", label: "CO₂ Saved (kg)" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 mb-3">
                <stat.icon size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <section className="max-w-6xl mx-auto py-16 md:py-24">
        <SectionHeader
          title="Why KiasuBites?"
          subtitle="Join thousands of food lovers and vendors making a difference"
        />
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: DollarSign,
              title: "Save Money",
              description:
                "Get quality food for 50-70% off the original price. It's a steal.",
              bgColor: "bg-yellow-50",
              iconColor: "text-yellow-600",
            },
            {
              icon: ShoppingBag,
              title: "Discover Food",
              description:
                "Try new cafes, bakeries, and restaurants in your area with surprise bags.",
              bgColor: "bg-primary-50",
              iconColor: "text-primary-600",
            },
            {
              icon: Leaf,
              title: "Help the Planet",
              description:
                "Every meal rescued is less CO₂e emitted. Eat well, do good.",
              bgColor: "bg-green-50",
              iconColor: "text-green-600",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
            >
              <Card className="p-8 text-center h-full">
                <motion.div
                  className={`w-16 h-16 rounded-2xl ${feature.bgColor} ${feature.iconColor} flex items-center justify-center mx-auto mb-6`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <feature.icon size={32} />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto py-16 md:py-24">
        <SectionHeader
          title="How It Works"
          subtitle="Simple, fast, and rewarding for everyone"
        />
        <div className="grid md:grid-cols-3 gap-8 relative">
          {[
            {
              step: "1",
              title: "Browse",
              description: "Discover surprise bags from local vendors near you",
            },
            {
              step: "2",
              title: "Reserve",
              description: "Book your bag and get a confirmation code",
            },
            {
              step: "3",
              title: "Pick Up",
              description: "Collect your food during the pickup window",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="relative"
            >
              {index < 2 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-primary-200 z-0" />
              )}
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-full bg-primary-600 text-white flex items-center justify-center text-4xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto py-16 md:py-24"
      >
        <BackgroundGradient className="rounded-[22px] p-12 md:p-16 bg-white text-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-900">
              Ready to rescue?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of foodies and vendors in the fight against food
              waste.
            </p>
            <Link to="/register">
              <Button
                size="lg"
                variant="secondary"
                className="bg-gray-900 text-white hover:bg-gray-800 border-0 px-10 md:px-16 py-4 whitespace-nowrap min-w-[280px] md:min-w-[320px]"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Join KiasuBites Free
              </Button>
            </Link>
          </div>
        </BackgroundGradient>
      </motion.section>
    </div>
  );
};

export default Landing;
