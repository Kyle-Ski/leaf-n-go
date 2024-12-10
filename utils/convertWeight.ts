// src/utils/convertWeight.ts

/**
 * Attempts to parse a weight input to a number.
 * @param input - Weight input as a string or number.
 * @returns Parsed number or null if parsing fails.
 */
const parseWeightInput = (input: string | number): number | null => {
    const weight = typeof input === 'string' ? parseFloat(input) : input;
  
    if (isNaN(weight)) {
      console.error(`Invalid weight input: ${input}`);
      return null;
    }
  
    return weight;
  };
  
  /**
   * Converts weight from pounds to kilograms.
   * @param weightInLbs - Weight in pounds as a string or number.
   * @returns Weight in kilograms or null if input is invalid.
   */
  export const lbsToKg = (weightInLbs: string | number): number | null => {
    const weight = parseWeightInput(weightInLbs);
    if (weight === null) return null;
    return weight * 0.45359237;
  };
  
  /**
   * Converts weight from kilograms to pounds.
   * @param weightInKg - Weight in kilograms as a string or number.
   * @returns Weight in pounds or null if input is invalid.
   */
  export const kgToLbs = (weightInKg: string | number): number | null => {
    const weight = parseWeightInput(weightInKg);
    if (weight === null) return null;
    return weight / 0.45359237;
  };
  
  /**
   * Formats the weight based on the user's preferred unit.
   * @param weightInLbs - Weight in pounds as a string or number.
   * @param unit - Preferred unit ('kg' or 'lbs').
   * @returns Formatted weight string or a fallback message if input is invalid.
   */
  export const formatWeight = (weightInLbs: string | number, unit: 'kg' | 'lbs'): string => {
    if (unit === 'kg') {
      const weightInKg = lbsToKg(weightInLbs);
      if (weightInKg === null) {
        return 'Invalid weight';
      }
      return `${weightInKg.toFixed(2)}`;
    } else {
      const weight = parseWeightInput(weightInLbs);
      if (weight === null) {
        return 'Invalid weight';
      }
      return `${weight.toFixed(2)}`;
    }
  };
  