import React from 'react';
import Svg, {
  Circle,
  Ellipse,
  Line,
  Path,
  Rect,
} from 'react-native-svg';

export type PlantIconVariant =
  | 'flower'
  | 'succulent'
  | 'tropical'
  | 'cactus'
  | 'fern'
  | 'tulip'
  | 'sunflower'
  | 'vine'
  | 'monstera'
  | 'snake';

interface Props {
  variant?: PlantIconVariant;
  size?: number;
}

// Deterministically pick a variant from a plant id
export function variantFromId(id: string): PlantIconVariant {
  const variants: PlantIconVariant[] = [
    'flower', 'succulent', 'tropical', 'cactus',
    'fern', 'tulip', 'sunflower', 'vine', 'monstera', 'snake'
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return variants[Math.abs(hash) % variants.length];
}

export default function PlantIcon({ variant = 'flower', size = 80 }: Props) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  switch (variant) {
    // ── Red flower ────────────────────────────────────────────────────────
    case 'flower':
      return (
        <Svg width={s} height={s} viewBox="0 0 100 100">
          {/* Stem */}
          <Path d="M50 95 Q50 65 50 55" stroke="#5A8A3C" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Leaves */}
          <Path d="M50 75 Q35 68 30 58 Q42 60 50 70" fill="#6AAB45" />
          <Path d="M50 70 Q65 63 70 53 Q58 55 50 65" fill="#6AAB45" />
          {/* Petals */}
          <Ellipse cx="50" cy="30" rx="10" ry="16" fill="#E05252" />
          <Ellipse cx="50" cy="30" rx="10" ry="16" fill="#E05252" transform="rotate(45 50 42)" />
          <Ellipse cx="50" cy="30" rx="10" ry="16" fill="#E05252" transform="rotate(90 50 42)" />
          <Ellipse cx="50" cy="30" rx="10" ry="16" fill="#E05252" transform="rotate(135 50 42)" />
          <Ellipse cx="50" cy="30" rx="10" ry="16" fill="#D44444" transform="rotate(22 50 42)" />
          <Ellipse cx="50" cy="30" rx="10" ry="16" fill="#D44444" transform="rotate(67 50 42)" />
          <Ellipse cx="50" cy="30" rx="10" ry="16" fill="#D44444" transform="rotate(112 50 42)" />
          <Ellipse cx="50" cy="30" rx="10" ry="16" fill="#D44444" transform="rotate(157 50 42)" />
          {/* Center */}
          <Circle cx="50" cy="42" r="10" fill="#F5C842" />
          <Circle cx="50" cy="42" r="5" fill="#E8B030" />
        </Svg>
      );

    // ── Succulent ─────────────────────────────────────────────────────────
    case 'succulent':
      return (
        <Svg width={s} height={s} viewBox="0 0 100 100">
          <Path d="M38 80 L62 80 L58 95 L42 95 Z" fill="#C4956A" />
          <Rect x="35" y="75" width="30" height="7" rx="2" fill="#B07D55" />
          <Ellipse cx="50" cy="55" rx="8" ry="20" fill="#7DBF6A" transform="rotate(-30 50 65)" />
          <Ellipse cx="50" cy="55" rx="8" ry="20" fill="#7DBF6A" transform="rotate(30 50 65)" />
          <Ellipse cx="50" cy="55" rx="8" ry="20" fill="#7DBF6A" transform="rotate(0 50 65)" />
          <Ellipse cx="50" cy="55" rx="8" ry="20" fill="#7DBF6A" transform="rotate(-60 50 65)" />
          <Ellipse cx="50" cy="55" rx="8" ry="20" fill="#7DBF6A" transform="rotate(60 50 65)" />
          <Ellipse cx="50" cy="60" rx="6" ry="14" fill="#98D47E" transform="rotate(-15 50 67)" />
          <Ellipse cx="50" cy="60" rx="6" ry="14" fill="#98D47E" transform="rotate(15 50 67)" />
          <Ellipse cx="50" cy="60" rx="6" ry="14" fill="#98D47E" />
          <Circle cx="50" cy="66" r="6" fill="#B8E89E" />
        </Svg>
      );

    // ── Tropical ──────────────────────────────────────────────────────────
    case 'tropical':
      return (
        <Svg width={s} height={s} viewBox="0 0 100 100">
          <Path d="M50 95 Q48 75 45 60" stroke="#5A8A3C" strokeWidth="4" strokeLinecap="round" fill="none" />
          <Path d="M45 60 Q20 45 18 20 Q35 25 45 45 Q55 25 72 20 Q70 45 55 55 Z" fill="#5AAB3C" />
          <Path d="M35 38 Q32 32 36 28" stroke="#4A9030" strokeWidth="3" fill="none" strokeLinecap="round" />
          <Path d="M55 38 Q58 32 54 28" stroke="#4A9030" strokeWidth="3" fill="none" strokeLinecap="round" />
          <Path d="M45 58 Q45 40 44 22" stroke="#4A9030" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </Svg>
      );

    // ── Cactus ────────────────────────────────────────────────────────────
    case 'cactus':
      return (
        <Svg width={s} height={s} viewBox="0 0 100 100">
          <Path d="M38 82 L62 82 L58 96 L42 96 Z" fill="#C4956A" />
          <Rect x="35" y="77" width="30" height="7" rx="2" fill="#B07D55" />
          <Rect x="43" y="30" width="14" height="50" rx="7" fill="#6DB85C" />
          <Path d="M43 55 Q28 55 28 40 Q28 30 35 30" stroke="#6DB85C" strokeWidth="10" fill="none" strokeLinecap="round" />
          <Path d="M57 60 Q72 60 72 45 Q72 35 65 35" stroke="#6DB85C" strokeWidth="10" fill="none" strokeLinecap="round" />
          {[35,45,55,65].map(y => (
            <React.Fragment key={y}>
              <Line x1="43" y1={y} x2="38" y2={y - 3} stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              <Line x1="57" y1={y} x2="62" y2={y - 3} stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </React.Fragment>
          ))}
          <Circle cx="50" cy="28" r="6" fill="#E87070" />
          <Circle cx="50" cy="28" r="3" fill="#F5C842" />
        </Svg>
      );

    // ── Fern ──────────────────────────────────────────────────────────────
    case 'fern':
      return (
        <Svg width={s} height={s} viewBox="0 0 100 100">
          <Path d="M36 82 L64 82 L60 96 L40 96 Z" fill="#C4956A" />
          <Rect x="33" y="77" width="34" height="7" rx="2" fill="#B07D55" />
          <Path d="M50 78 Q40 60 20 45" stroke="#5AAB3C" strokeWidth="3" fill="none" strokeLinecap="round" />
          <Path d="M50 78 Q60 60 80 45" stroke="#5AAB3C" strokeWidth="3" fill="none" strokeLinecap="round" />
          <Path d="M50 78 Q45 55 35 30" stroke="#5AAB3C" strokeWidth="3" fill="none" strokeLinecap="round" />
          <Path d="M50 78 Q55 55 65 30" stroke="#5AAB3C" strokeWidth="3" fill="none" strokeLinecap="round" />
          <Path d="M50 78 Q50 55 50 25" stroke="#5AAB3C" strokeWidth="3" fill="none" strokeLinecap="round" />
          {[[35,58],[28,50],[22,44]].map(([x,y],i) => (
            <Ellipse key={`f1-${i}`} cx={x} cy={y} rx="5" ry="3" fill="#7DBF6A" transform={`rotate(-40 ${x} ${y})`} />
          ))}
          {[[65,58],[72,50],[78,44]].map(([x,y],i) => (
            <Ellipse key={`f2-${i}`} cx={x} cy={y} rx="5" ry="3" fill="#7DBF6A" transform={`rotate(40 ${x} ${y})`} />
          ))}
          {[[42,55],[37,42],[33,30]].map(([x,y],i) => (
            <Ellipse key={`f3-${i}`} cx={x} cy={y} rx="5" ry="3" fill="#7DBF6A" transform={`rotate(-60 ${x} ${y})`} />
          ))}
          {[[58,55],[63,42],[67,30]].map(([x,y],i) => (
            <Ellipse key={`f4-${i}`} cx={x} cy={y} rx="5" ry="3" fill="#7DBF6A" transform={`rotate(60 ${x} ${y})`} />
          ))}
        </Svg>
      );

    // ── Tulip ─────────────────────────────────────────────────────────────
    case 'tulip':
      return (
        <Svg width={s} height={s} viewBox="0 0 100 100">
          <Path d="M50 95 L50 55" stroke="#5A8A3C" strokeWidth="4" strokeLinecap="round" />
          <Path d="M50 75 Q38 68 34 55 Q46 60 50 70" fill="#6AAB45" />
          <Path d="M50 68 Q62 61 66 48 Q54 53 50 63" fill="#6AAB45" />
          <Path d="M50 55 Q36 50 34 35 Q42 28 50 40 Q58 28 66 35 Q64 50 50 55Z" fill="#E87070" />
          <Path d="M50 55 Q50 35 50 25 Q46 28 44 38 Q47 48 50 55Z" fill="#D45858" />
          <Path d="M50 55 Q50 35 50 25 Q54 28 56 38 Q53 48 50 55Z" fill="#C44040" />
        </Svg>
      );

    // ── Sunflower ─────────────────────────────────────────────────────────
    case 'sunflower':
      return (
        <Svg width={s} height={s} viewBox="0 0 100 100">
          <Path d="M50 95 Q52 75 50 55" stroke="#5A8A3C" strokeWidth="4" strokeLinecap="round" fill="none" />
          <Path d="M50 80 Q36 72 32 60 Q44 62 50 73" fill="#6AAB45" />
          <Path d="M50 72 Q64 64 68 52 Q56 54 50 65" fill="#6AAB45" />
          {Array.from({ length: 12 }).map((_, i) => (
            <Ellipse
              key={i}
              cx="50"
              cy="33"
              rx="5"
              ry="13"
              fill="#F5C842"
              transform={`rotate(${i * 30} 50 46)`}
            />
          ))}
          <Circle cx="50" cy="46" r="12" fill="#7B4F1E" />
          <Circle cx="50" cy="46" r="8" fill="#6B3F10" />
          {[[50,40],[50,52],[44,43],[56,43],[44,49],[56,49]].map(([x,y],i) => (
            <Circle key={i} cx={x} cy={y} r="1.5" fill="#8B5E28" />
          ))}
        </Svg>
      );

    // ── Vine ──────────────────────────────────────────────────────────────
    case 'vine':
      return (
        <Svg width={s} height={s} viewBox="0 0 100 100">
          <Path d="M36 70 L64 70 L60 84 L40 84 Z" fill="#C4956A" />
          <Rect x="33" y="65" width="34" height="7" rx="2" fill="#B07D55" />
          <Path d="M42 65 Q30 75 20 90" stroke="#5A8A3C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M50 65 Q50 80 45 95" stroke="#5A8A3C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M58 65 Q70 75 80 90" stroke="#5A8A3C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M44 65 Q38 50 28 35" stroke="#5A8A3C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M56 65 Q62 50 72 35" stroke="#5A8A3C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M50 65 Q50 45 50 20" stroke="#5A8A3C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {[[28,36],[44,46],[22,52],[72,36],[56,46],[78,52],[50,25],[45,80],[78,82],[22,82]].map(([x,y],i) => (
            <Path
              key={i}
              d={`M${x} ${y+4} Q${x-5} ${y-2} ${x} ${y-4} Q${x+5} ${y-2} ${x} ${y+4}Z`}
              fill="#7DBF6A"
              transform={`rotate(${i * 36} ${x} ${y})`}
            />
          ))}
        </Svg>
      );

    // ── Monstera ──────────────────────────────────────────────────────────
    case 'monstera':
      return (
        <Svg width={s} height={s} viewBox="0 0 100 100">
          {/* Pot */}
          <Path d="M36 82 L64 82 L60 96 L40 96 Z" fill="#C4956A" />
          <Rect x="33" y="77" width="34" height="7" rx="2" fill="#B07D55" />
          {/* Leaf 1 (Left) */}
          <Path d="M45 80 Q30 50 20 50 C10 50 15 25 35 30 Q45 35 45 80 Z" fill="#4A9030" />
          <Path d="M25 38 L30 45" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
          {/* Leaf 2 (Right) */}
          <Path d="M55 80 Q70 50 80 50 C90 50 85 25 65 30 Q55 35 55 80 Z" fill="#5AAB3C" />
          <Path d="M75 38 L70 45" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
          {/* Leaf 3 (Center High) */}
          <Path d="M50 80 Q50 30 50 20 C35 15 65 15 50 20 Z" fill="#6AAB45" />
          <Circle cx="45" cy="25" r="2" fill="#fff" opacity="0.4" />
          <Circle cx="55" cy="28" r="1.5" fill="#fff" opacity="0.4" />
        </Svg>
      );

    // ── Snake Plant ───────────────────────────────────────────────────────
    case 'snake':
      return (
        <Svg width={s} height={s} viewBox="0 0 100 100">
          {/* Pot */}
          <Path d="M38 82 L62 82 L58 96 L42 96 Z" fill="#C4956A" />
          <Rect x="35" y="77" width="30" height="7" rx="2" fill="#B07D55" />
          {/* Back Leaves */}
          <Path d="M45 80 Q35 40 25 20 Q48 40 50 80 Z" fill="#4A9030" />
          <Path d="M55 80 Q65 40 75 20 Q52 40 50 80 Z" fill="#4A9030" />
          {/* Front Leaves (with yellow edges/accents) */}
          <Path d="M42 80 Q45 35 45 10 Q55 35 55 80 Z" fill="#6AAB45" />
          <Path d="M44 80 Q47 35 45 10 Q53 35 53 80 Z" fill="#E8B030" opacity="0.3" />
          <Path d="M40 80 Q35 50 20 35 Q40 50 45 80 Z" fill="#5AAB3C" />
          <Path d="M60 80 Q65 50 80 35 Q60 50 55 80 Z" fill="#5AAB3C" />
        </Svg>
      );

    default:
      return null;
  }
}