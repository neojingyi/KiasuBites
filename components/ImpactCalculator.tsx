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
  const [extraBagsPerDay, setExtraBagsPerDay] = useState(0);

  // Calculate base bags per day from current schedule
  const baseBagsPerDay = useMemo(() => {
    return calculateBaseBagsPerDay(availability);
  }, [availability]);

  // Fetch impact estimate
  const { data: impactEstimate, isLoading } = useQuery({
    queryKey: ['impactEstimate', user?.id, baseBagsPerDay, extraBagsPerDay],
    queryFn: () => api.getImpactEstimate(user!.id, baseBagsPerDay, extraBagsPerDay),
    enabled: !!user && baseBagsPerDay >= 0,
  });

  // Preview impact when slider changes
  const { data: previewEstimate } = useQuery({
    queryKey: ['impactPreview', user?.id, baseBagsPerDay, extraBagsPerDay],
    queryFn: () => api.previewImpact(user!.id, baseBagsPerDay, extraBagsPerDay),
    enabled: !!user && baseBagsPerDay >= 0,
  });

  const currentEstimate = previewEstimate || impactEstimate;

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: (extraBags: number) => 
      api.updateScheduleFromImpact(user!.id, baseBagsPerDay, extraBags),
    onSuccess: (updatedAvailability) => {
      queryClient.invalidateQueries({ queryKey: ['impactEstimate'] });
      queryClient.invalidateQueries({ queryKey: ['impactPreview'] });
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
    setExtraBagsPerDay(value);
  };

  const handleUpdateSchedule = () => {
    if (!user) return;
    updateScheduleMutation.mutate(extraBagsPerDay);
  };

  if (!currentEstimate || baseBagsPerDay === 0) {
    return (
      <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <Leaf className="text-green-600" size={28} />
          <h2 className="text-3xl font-bold text-gray-900">Every Surprise Bag counts</h2>
        </div>
        <p className="text-gray-600">
          Set at least one active day in your weekly schedule to see your impact calculations.
        </p>
      </Card>
    );
  }

  const config = currentEstimate.config;
  const sliderValue = extraBagsPerDay;

  return (
    <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <div className="flex items-center gap-3 mb-6">
        <Leaf className="text-green-600" size={28} />
        <h2 className="text-3xl font-bold text-gray-900">Every Surprise Bag counts</h2>
      </div>

      {/* Headline Metrics */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl p-6 border border-green-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="text-green-600" size={24} />
            <p className="text-sm font-medium text-gray-600">Money saved per year</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentEstimate.moneySavedPerYear}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="text-4xl font-bold text-gray-900"
            >
              {formatCurrency(currentEstimate.moneySavedPerYear, config.currency)}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-green-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <Droplets className="text-blue-600" size={24} />
            <p className="text-sm font-medium text-gray-600">Hot showers equivalent</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentEstimate.hoursOfHotShowers}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="text-4xl font-bold text-gray-900"
            >
              {formatHours(currentEstimate.hoursOfHotShowers)}
            </motion.p>
            <p className="text-sm text-gray-600 mt-1">of hot showers</p>
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-green-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="text-emerald-600" size={24} />
            <p className="text-sm font-medium text-gray-600">CO2e avoided per year</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentEstimate.co2eAvoidedPerYearKg}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="text-4xl font-bold text-gray-900"
            >
              {formatCO2e(currentEstimate.co2eAvoidedPerYearKg)}
            </motion.p>
            <p className="text-sm text-gray-600 mt-1">avoided per year</p>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Surprise Bags per Year */}
      <div className="bg-white rounded-xl p-8 border border-green-200 mb-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEstimate.bagsPerYear}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-6xl font-bold text-green-600 mb-2">
              {formatBagsPerYear(currentEstimate.bagsPerYear)}
            </p>
            <p className="text-xl font-semibold text-gray-700">
              Surprise Bags saved per year
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slider Control */}
      <div className="bg-white rounded-xl p-6 border border-green-200 mb-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">
              Extra Surprise Bags per day
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                {sliderValue > 0 ? '+' : ''}{sliderValue}
              </span>
              <span className="text-sm text-gray-600">
                {Math.abs(sliderValue)} Surprise Bag{Math.abs(sliderValue) !== 1 ? 's' : ''} per day
              </span>
            </div>
          </div>
          
          <input
            type="range"
            min={config.sliderMin}
            max={config.sliderMax}
            value={sliderValue}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${(sliderValue / config.sliderMax) * 100}%, #e5e7eb ${(sliderValue / config.sliderMax) * 100}%, #e5e7eb 100%)`
            }}
            aria-label="Extra Surprise Bags per day"
            aria-valuemin={config.sliderMin}
            aria-valuemax={config.sliderMax}
            aria-valuenow={sliderValue}
          />
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{config.sliderMin}</span>
            <span>{config.sliderMax}</span>
          </div>
        </div>

        <Button
          onClick={handleUpdateSchedule}
          isLoading={updateScheduleMutation.isPending}
          variant="primary"
          className="w-full flex items-center justify-center gap-2"
          disabled={sliderValue === 0}
        >
          <TrendingUp size={18} />
          Update weekly schedule
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 leading-relaxed">
          <strong>Note:</strong> This number is a close estimate and can be achieved if all of your listed Surprise Bags get saved over a one-year period.
        </p>
      </div>
    </Card>
  );
};

export default ImpactCalculator;

