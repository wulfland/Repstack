/**
 * Generate split day configurations based on training split type
 * Re-exports the existing generateDefaultSplitDays from splitUtils for consistency
 */

import { generateDefaultSplitDays } from './splitUtils';
import type { MesocycleSplitDay } from '../types/models';

/**
 * Generates empty split day configurations for a given training split type
 * Users can configure exercises for these split days later
 */
export function generateSplitDays(
  trainingSplit:
    | 'upper_lower'
    | 'push_pull_legs'
    | 'full_body'
    | 'bro_split'
    | 'custom'
): MesocycleSplitDay[] {
  return generateDefaultSplitDays(trainingSplit);
}
