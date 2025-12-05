/**
 * Impact Calculator Configuration
 * 
 * This file contains all configurable constants for the impact calculator.
 * These values can be adjusted based on business requirements, regional differences,
 * or updated research data.
 * 
 * In production, these could be stored in a database configuration table
 * or environment variables for easy updates without code changes.
 */

import { ImpactConfig } from '../types';

/**
 * Default impact configuration
 * 
 * These values are estimates based on:
 * - Average food waste value per surprise bag
 * - CO2e emissions from food waste (based on food waste lifecycle)
 * - Equivalent calculations for user-friendly metrics
 */
export const DEFAULT_IMPACT_CONFIG: ImpactConfig = {
  // Average money saved per surprise bag (in base currency)
  // This represents the value of food that would have been wasted
  moneySavedPerBag: 2.89, // e.g., SGD 2.89 per bag
  
  // CO2e emissions avoided per bag saved (in kg)
  // Based on average food waste CO2e footprint
  co2eSavedPerBagKg: 2.7, // kg CO2e per bag
  
  // Equivalent hours of hot showers per kg CO2e
  // Used for user-friendly equivalent metrics
  // Average hot shower: ~0.4 kg CO2e per hour
  hoursOfShowersPerKgCo2e: 2.5, // hours per kg CO2e
  
  // Slider bounds for extra bags per day
  sliderMin: 0,
  sliderMax: 20,
  
  // Currency code for display
  currency: 'SGD', // Can be changed to GBP, USD, etc.
};

/**
 * Get impact configuration for a vendor
 * 
 * In production, this would fetch vendor-specific or regional config
 * from a database. For now, returns default config.
 */
export const getImpactConfig = async (vendorId?: string): Promise<ImpactConfig> => {
  // In production: fetch from database or API
  // const config = await api.getImpactConfig(vendorId);
  // return config || DEFAULT_IMPACT_CONFIG;
  
  return DEFAULT_IMPACT_CONFIG;
};

/**
 * Calculate impact metrics based on bags per day
 */
export const calculateImpact = (
  baseBagsPerDay: number,
  extraBagsPerDay: number,
  config: ImpactConfig
): Omit<ImpactEstimate, 'baseBagsPerDay' | 'extraBagsPerDay' | 'config'> => {
  const totalBagsPerDay = baseBagsPerDay + extraBagsPerDay;
  const bagsPerYear = totalBagsPerDay * 365;
  
  const moneySavedPerYear = bagsPerYear * config.moneySavedPerBag;
  const co2eAvoidedPerYearKg = bagsPerYear * config.co2eSavedPerBagKg;
  const hoursOfHotShowers = co2eAvoidedPerYearKg * config.hoursOfShowersPerKgCo2e;
  
  return {
    totalBagsPerDay,
    bagsPerYear: Math.round(bagsPerYear),
    moneySavedPerYear,
    co2eAvoidedPerYearKg,
    hoursOfHotShowers,
  };
};

