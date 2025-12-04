import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, SectionHeader } from '../components/UI';
import { ShoppingBag, DollarSign, Leaf, Sparkles, TrendingDown, Users, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import bagImage from '../assets/Untitled design (4).png';

const Landing: React.FC = () => {
  const { user } = useAuth();
  const [showBag, setShowBag] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    setShowBag(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="space-y-24 md:space-y-32 py-12 md:py-20">
      {/* Hero Section */}
      <motion.section 
        className="text-center space-y-8 max-w-4xl mx-auto relative"
        style={{ y, opacity }}
      >
        {/* Bouncing Bag Animation */}
        <motion.div 
          className="flex justify-center mb-12"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
        >
          <motion.img 
            src={bagImage} 
            alt="KiasuBites Bag" 
            className="w-40 h-40 md:w-48 md:h-48 object-contain"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6"
          >
            Good food shouldn't{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">
              go to waste.
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Rescue delicious surplus food from your favorite local shops at a fraction of the price.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center gap-4 pt-8"
          >
            {!user && (
              <>
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Log In
                  </Button>
                </Link>
              </>
            )}
            {user && (
              <Link to={user.role === 'vendor' ? "/vendor/dashboard" : "/consumer/home"}>
                <Button size="lg" className="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Stats Bar */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Users, value: '10K+', label: 'Active Users' },
            { icon: ShoppingBag, value: '5K+', label: 'Bags Rescued' },
            { icon: TrendingDown, value: '70%', label: 'Average Savings' },
            { icon: Leaf, value: '2.5T', label: 'CO₂ Saved (kg)' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 mb-3">
                <stat.icon size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <section className="max-w-6xl mx-auto">
        <SectionHeader
          title="Why KiasuBites?"
          subtitle="Join thousands of food lovers and vendors making a difference"
        />
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: DollarSign,
              title: 'Save Money',
              description: 'Get quality food for 50-70% off the original price. It\'s a steal.',
              gradient: 'from-accent-50 to-accent-100',
              iconColor: 'text-accent-600',
            },
            {
              icon: ShoppingBag,
              title: 'Discover Food',
              description: 'Try new cafes, bakeries, and restaurants in your area with surprise bags.',
              gradient: 'from-primary-50 to-primary-100',
              iconColor: 'text-primary-600',
            },
            {
              icon: Leaf,
              title: 'Help the Planet',
              description: 'Every meal rescued is less CO₂e emitted. Eat well, do good.',
              gradient: 'from-green-50 to-green-100',
              iconColor: 'text-green-600',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
            >
              <Card className="p-8 text-center h-full hover:shadow-xl transition-shadow duration-300">
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} ${feature.iconColor} flex items-center justify-center mx-auto mb-6`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <feature.icon size={32} />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto">
        <SectionHeader
          title="How It Works"
          subtitle="Simple, fast, and rewarding for everyone"
        />
        <div className="grid md:grid-cols-3 gap-8 relative">
          {[
            { step: '1', title: 'Browse', description: 'Discover surprise bags from local vendors near you' },
            { step: '2', title: 'Reserve', description: 'Book your bag and get a confirmation code' },
            { step: '3', title: 'Pick Up', description: 'Collect your food during the pickup window' },
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
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary-200 to-transparent z-0" />
              )}
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center text-4xl font-bold shadow-xl shadow-primary-500/30 mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{item.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{item.description}</p>
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
        className="max-w-4xl mx-auto"
      >
        <Card className="p-12 md:p-16 text-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white border-0 overflow-hidden relative">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Ready to rescue?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of foodies and vendors in the fight against food waste.
            </p>
            <Link to="/register">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-primary-700 hover:bg-gray-50 border-0 shadow-xl"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Join KiasuBites Free
              </Button>
            </Link>
          </div>
        </Card>
      </motion.section>
    </div>
  );
};

export default Landing;
