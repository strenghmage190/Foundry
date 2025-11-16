import { CustomizationSettings } from '../types';

interface AvatarProps {
  sanity: number;
  maxSanity: number;
  vitality: number;
  maxVitality: number;
  avatarUrl?: string | null;
  customization?: CustomizationSettings | null;
}

export const getAvatarForSanityAndVitality = ({
  sanity,
  maxSanity,
  vitality,
  maxVitality,
  avatarUrl,
  customization,
}: AvatarProps): string | undefined => {
  const sanityPct = maxSanity > 0 ? (sanity / maxSanity) * 100 : 100;
  const vitalityPct = maxVitality > 0 ? (vitality / maxVitality) * 100 : 100;

  const healthy = customization?.avatarHealthy || undefined;
  const hurt = customization?.avatarHurt || undefined;
  const disturbed = customization?.avatarDisturbed || undefined;
  const insane = customization?.avatarInsane || undefined;

  // Death or zero vitality → use hurt as the closest fallback, else avatarUrl
  if (vitality <= 0) return hurt || avatarUrl || healthy;

  // Low vitality (<30%) prioritizes hurt state over mental states
  if (vitalityPct < 30) return hurt || avatarUrl || healthy;

  // Mental state avatars based on sanity
  if (sanityPct < 20) return insane || disturbed || avatarUrl || healthy;
  if (sanityPct < 60) return disturbed || avatarUrl || healthy;

  // Default healthy/avatar
  return avatarUrl || healthy;
};