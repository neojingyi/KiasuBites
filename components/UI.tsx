import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Button with 3D depth and animations
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', isLoading, className = '', disabled, ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative";
  
  const variants = {
    primary: "bg-gradient-to-b from-primary-600 to-primary-700 text-white focus:ring-primary-500 border border-primary-700/50",
    secondary: "bg-gradient-to-b from-primary-50 to-primary-100 text-primary-700 focus:ring-primary-500 border border-primary-200",
    outline: "border-2 border-gray-300 bg-white/80 backdrop-blur-sm text-gray-700",
    ghost: "bg-transparent text-gray-700",
    danger: "bg-gradient-to-b from-red-600 to-red-700 text-white focus:ring-red-500 border border-red-700/50",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm rounded-lg",
    md: "h-11 px-6 text-base rounded-xl",
    lg: "h-14 px-8 text-lg rounded-xl font-semibold",
  };

  const buttonClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  const shadowStyle = variant === 'primary' || variant === 'danger'
    ? '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
    : '0 1px 2px rgba(0, 0, 0, 0.05)';

  return (
    <motion.button 
      className={buttonClasses}
      disabled={disabled || isLoading}
      whileHover={{ 
        y: -1,
        transition: { duration: 0.15, ease: "easeOut" }
      }}
      whileTap={{ 
        y: 1,
        scale: 0.97,
        transition: { duration: 0.1 }
      }}
      style={{
        boxShadow: shadowStyle
      }}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// Enhanced Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, helperText, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2 tracking-tight">
          {label}
        </label>
      )}
      <motion.input 
        className={`w-full rounded-xl border-2 transition-all duration-200 px-4 py-3 text-sm bg-white/80 backdrop-blur-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 hover:border-gray-300'
        } ${className}`}
        whileFocus={{ scale: 1.01 }}
        {...props}
      />
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 font-medium"
        >
          {error}
        </motion.p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

// Enhanced Card with depth and hover effects
export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  onClick?: () => void;
  hover?: boolean;
}> = ({ children, className = '', onClick, hover = true }) => {
  return (
    <motion.div 
      onClick={onClick}
      className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/80 shadow-lg shadow-black/5 overflow-hidden ${
        onClick || hover ? 'cursor-pointer' : ''
      } ${className}`}
      whileHover={hover ? {
        y: -4,
        scale: 1.01,
        transition: { duration: 0.2, ease: "easeOut" }
      } : {}}
      whileTap={onClick ? {
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {}}
      style={{
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      {children}
    </motion.div>
  );
};

// Enhanced Badge
export const Badge: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'success' | 'warning' | 'neutral' | 'error';
  size?: 'sm' | 'md';
}> = ({ children, variant = 'neutral', size = 'md' }) => {
  const styles = {
    success: "bg-gradient-to-br from-green-50 to-green-100 text-green-800 border border-green-200",
    warning: "bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-800 border border-yellow-200",
    neutral: "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border border-gray-200",
    error: "bg-gradient-to-br from-red-50 to-red-100 text-red-800 border border-red-200",
  };
  
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };
  
  return (
    <motion.span 
      className={`inline-flex items-center font-semibold rounded-full ${styles[variant]} ${sizes[size]}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.span>
  );
};

// Enhanced Modal with backdrop blur
export const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className={`bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full ${sizeClasses[size]} overflow-hidden border border-gray-200/50`}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50/50 to-white">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
          <motion.button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>
        <div className="px-6 py-6">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Section Header component
export const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  className?: string;
}> = ({ title, subtitle, className = '' }) => {
  return (
    <motion.div 
      className={`text-center mb-12 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
