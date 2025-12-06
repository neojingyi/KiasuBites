/**
 * Impact Calculator Utilities
 * 
 * Helper functions for calculating and formatting impact metrics
 */

import { ImpactConfig, ImpactEstimate } from '../types';
import { calculateImpact } from '../config/impactConfig';

/**
 * Calculate base bags per day from weekly availability schedule
 * 
 * Formula: Average of defaultQuantity across all active days
 */
export const calculateBaseBagsPerDay = (
  availability: Record<string, { available: boolean; defaultQuantity: number }>
): number => {
  const activeDays = Object.values(availability).filter(day => day.available);
  
  if (activeDays.length === 0) return 0;
  
  const totalQuantity = activeDays.reduce((sum, day) => sum + day.defaultQuantity, 0);
  return totalQuantity / activeDays.length;
};

/**
 * Format currency value
 */
export const formatCurrency = (value: number, currency: string = 'SGD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};

/**
 * Format CO2e value
 */
export const formatCO2e = (kg: number): string => {
  if (!kg || isNaN(kg) || kg <= 0) return '0 kg of CO2e';
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} t of CO2e`;
  }
  return `${Math.round(kg)} kg of CO2e`;
};

/**
 * Format hours value
 */
export const formatHours = (hours: number): string => {
  if (!hours || isNaN(hours) || hours <= 0) return '0 mins';
  if (hours >= 1) {
    return `${Math.round(hours)} hrs`;
  }
  return `${Math.round(hours * 60)} mins`;
};

/**
 * Format bags per year
 */
export const formatBagsPerYear = (bags: number): string => {
  return `${bags.toLocaleString()}`;
};

/**
 * Distribute total bags per day across active days in schedule
 * 
 * Maintains the existing pattern by distributing evenly across active days
 */
export const distributeBagsAcrossSchedule = (
  availability: Record<string, { available: boolean; defaultQuantity: number }>,
  totalBagsPerDay: number
): Record<string, { available: boolean; defaultQuantity: number }> => {
  const activeDays = Object.keys(availability).filter(
    day => availability[day].available
  );
  
  if (activeDays.length === 0) return availability;
  
  // Distribute evenly across active days
  const bagsPerActiveDay = Math.round(totalBagsPerDay);
  
  const updated = { ...availability };
  activeDays.forEach(day => {
    updated[day] = {
      ...updated[day],
      defaultQuantity: bagsPerActiveDay,
    };
  });
  
  return updated;
};

