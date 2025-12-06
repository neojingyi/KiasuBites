import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Card, Button } from './UI';
import { WeeklyAvailability, ImpactEstimate } from '../types';
import { calculateBaseBagsPerDay, formatCurrency, formatCO2e, formatHours, formatBagsPerYear } from '../utils/impactCalculator';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, DollarSign, Droplets, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImpactCalculatorProps {
  availability: WeeklyAvailability;
  onScheduleUpdate?: (updatedAvailability: WeeklyAvailability) => void;
}

const ImpactCalculator: React.FC<ImpactCalculatorProps> = ({ 
  availability, 
  onScheduleUpdate 
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Calculate base bags per day from current schedule
  const baseBagsPerDay = useMemo(() => {
    return calculateBaseBagsPerDay(availability);
  }, [availability]);

  // Use total bags per day as the slider value (starts at current base)
  const [totalBagsPerDay, setTotalBagsPerDay] = useState(baseBagsPerDay);

  // Update slider when base changes
  useEffect(() => {
    setTotalBagsPerDay(baseBagsPerDay);
  }, [baseBagsPerDay]);

  // Fetch impact estimate once with base value
  const { data: impactEstimate, isLoading } = useQuery({
    queryKey: ['impactEstimate', user?.id, baseBagsPerDay],
    queryFn: () => api.getImpactEstimate(user!.id, baseBagsPerDay, 0),
    enabled: !!user && baseBagsPerDay >= 0,
  });

  // Calculate impact locally for smooth updates without refetching
  const currentEstimate = useMemo(() => {
    if (!impactEstimate || !totalBagsPerDay || totalBagsPerDay <= 0 || isNaN(totalBagsPerDay)) return null;
    
    // Calculate new values based on totalBagsPerDay without refetching
    const bagsPerYear = totalBagsPerDay * 365;
    
    const config = impactEstimate.config;
    if (!config || !config.moneySavedPerBag || !config.co2eSavedPerBagKg || !config.hoursOfShowersPerKgCo2e) {
      return null;
    }
    
    const moneySavedPerYear = bagsPerYear * config.moneySavedPerBag;
    const co2eAvoidedPerYearKg = bagsPerYear * config.co2eSavedPerBagKg;
    const hoursOfHotShowers = co2eAvoidedPerYearKg * config.hoursOfShowersPerKgCo2e;
    
    return {
      ...impactEstimate,
      bagsPerYear: Math.round(bagsPerYear),
      moneySavedPerYear: moneySavedPerYear || 0,
      co2eAvoidedPerYearKg: co2eAvoidedPerYearKg || 0,
      hoursOfHotShowers: hoursOfHotShowers || 0,
    };
  }, [impactEstimate, totalBagsPerDay]);

  // Update schedule mutation - SET the value to what's on the slider
  const updateScheduleMutation = useMutation({
    mutationFn: (bagsPerDay: number) => 
      api.updateScheduleFromImpact(user!.id, bagsPerDay, 0), // Pass total as base, 0 as extra
    onSuccess: (updatedAvailability) => {
      queryClient.invalidateQueries({ queryKey: ['impactEstimate'] });
      if (onScheduleUpdate) {
        onScheduleUpdate(updatedAvailability);
      }
      toast.success('Weekly schedule updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update schedule');
    }
  });

  const handleSliderChange = (value: number) => {
    setTotalBagsPerDay(value);
  };

  const handleUpdateSchedule = () => {
    if (!user) return;
    // Set the schedule to the slider value (total bags per day)
    updateScheduleMutation.mutate(totalBagsPerDay);
  };

  if (!currentEstimate || baseBagsPerDay === 0) {
    return (
      <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <Leaf className="text-green-600" size={18} />
          <h2 className="text-lg font-bold text-gray-900">Every Surprise Bag counts</h2>
        </div>
        <p className="text-sm text-gray-600">
          Set at least one active day in your weekly schedule to see your impact calculations.
        </p>
      </Card>
    );
  }

  const config = currentEstimate.config;

  return (
    <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="text-green-600" size={18} />
        <h2 className="text-lg font-bold text-gray-900">Every Surprise Bag counts</h2>
      </div>

      {/* Headline Metrics */}
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg p-3 border border-green-200 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-green-600" size={16} />
            <p className="text-xs font-medium text-gray-600">Money saved per year</p>
          </div>
          <motion.p
            key={currentEstimate.moneySavedPerYear}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="text-xl font-bold text-gray-900"
          >
            {formatCurrency(currentEstimate.moneySavedPerYear, config.currency)}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="bg-white rounded-lg p-3 border border-green-200 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="text-blue-600" size={16} />
            <p className="text-xs font-medium text-gray-600">Hot showers equivalent</p>
          </div>
          <motion.p
            key={currentEstimate.hoursOfHotShowers}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="text-xl font-bold text-gray-900"
          >
            {formatHours(currentEstimate.hoursOfHotShowers)}
          </motion.p>
          <p className="text-xs text-gray-600 mt-0.5">of hot showers</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="bg-white rounded-lg p-3 border border-green-200 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-emerald-600" size={16} />
            <p className="text-xs font-medium text-gray-600">CO2e avoided per year</p>
          </div>
          <motion.p
            key={currentEstimate.co2eAvoidedPerYearKg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="text-xl font-bold text-gray-900"
          >
            {formatCO2e(currentEstimate.co2eAvoidedPerYearKg)}
          </motion.p>
          <p className="text-xs text-gray-600 mt-0.5">avoided per year</p>
        </motion.div>
      </div>

      {/* Surprise Bags per Year */}
      <div className="bg-white rounded-lg p-4 border border-green-200 mb-4 text-center">
        <motion.p
          key={currentEstimate.bagsPerYear}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="text-3xl font-bold text-green-600 mb-1"
        >
          {formatBagsPerYear(currentEstimate.bagsPerYear)}
        </motion.p>
        <p className="text-sm font-semibold text-gray-700">
          Surprise Bags saved per year
        </p>
      </div>

      {/* Slider Control */}
      <div className="bg-white rounded-lg p-4 border border-green-200 mb-3">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-700">
              Surprise Bags per day
            </label>
            <span className="text-lg font-bold text-green-600">
              {totalBagsPerDay}
            </span>
          </div>
          
          <input
            type="range"
            min={config.sliderMin}
            max={config.sliderMax}
            value={totalBagsPerDay}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${((totalBagsPerDay - config.sliderMin) / (config.sliderMax - config.sliderMin)) * 100}%, #e5e7eb ${((totalBagsPerDay - config.sliderMin) / (config.sliderMax - config.sliderMin)) * 100}%, #e5e7eb 100%)`
            }}
            aria-label="Surprise Bags per day"
            aria-valuemin={config.sliderMin}
            aria-valuemax={config.sliderMax}
            aria-valuenow={totalBagsPerDay}
          />
          
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>{config.sliderMin}</span>
            <span>{config.sliderMax}</span>
          </div>
        </div>

        <Button
          onClick={handleUpdateSchedule}
          isLoading={updateScheduleMutation.isPending}
          variant="primary"
          size="sm"
          className="w-full flex items-center justify-center gap-2"
        >
          <TrendingUp size={14} />
          Update weekly schedule
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800 leading-relaxed">
          <strong>Note:</strong> This number is a close estimate and can be achieved if all of your listed Surprise Bags get saved over a one-year period.
        </p>
      </div>
    </Card>
  );
};

export default ImpactCalculator;

