/**
 * Hook for fetching previous performance data for exercises
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { getPreviousPerformance } from '../db/service';

export function usePreviousPerformance(exerciseId: string | undefined) {
  return useLiveQuery(async () => {
    if (!exerciseId) return null;
    return await getPreviousPerformance(exerciseId);
  }, [exerciseId]);
}
