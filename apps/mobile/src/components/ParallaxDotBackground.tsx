import { Gyroscope } from 'expo-sensors';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Menos capas y más espacio = fluidez en cualquier celular
const LAYERS = [
  { z: 0.35, spacing: 40, parallax: 1.0, dotSize: 2.8 },
  { z: 0.85, spacing: 20, parallax: 0.25, dotSize: 4.4 },
];

const MAX_TILT = 48;
const LAYER_W = width + 120;
const LAYER_H = height + 120;
const GYRO_INTERVAL_MS = Platform.OS === 'android' ? 48 : 32;

function buildLayerDots(spacing: number) {
  const cols = Math.ceil(width / spacing) + 2;
  const rows = Math.ceil(height / spacing) + 2;
  const dots: { x: number; y: number }[] = [];
  const offsetX = -spacing;
  const offsetY = -spacing;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({ x: offsetX + c * spacing, y: offsetY + r * spacing });
    }
  }
  return dots;
}

function hexPointsAt(x: number, y: number, size: number) {
  const w = size;
  const h = (size * Math.sqrt(3)) / 2;
  return [
    [x + w * 0.25, y],
    [x + w * 0.75, y],
    [x + w, y + h / 2],
    [x + w * 0.75, y + h],
    [x + w * 0.25, y + h],
    [x, y + h / 2],
  ]
    .map(([px, py]) => `${px},${py}`)
    .join(' ');
}

function getDotColor(idx: number, z: number): string {
  const mod7 = idx % 7;
  const mod5 = idx % 5;
  const mod3 = idx % 3;
  if (mod7 === 0) return `rgba(93, 214, 44, ${(z * 0.9).toFixed(2)})`;
  if (mod5 === 0) return `rgba(51, 116, 24, ${(z * 0.85).toFixed(2)})`;
  if (mod3 === 0) return `rgba(248, 248, 248, ${(z * 0.4).toFixed(2)})`;
  return `rgba(32, 32, 32, ${(z * 0.8).toFixed(2)})`;
}

export default function ParallaxDotBackground() {
  const gyroAngle = useRef({ x: 0, y: 0 });
  const lastTs = useRef<number | null>(null);
  const smoothAngle = useRef({ x: 0, y: 0 });

  const layerTranslates = useRef(
    LAYERS.map(() => ({ x: new Animated.Value(0), y: new Animated.Value(0) }))
  ).current;

  const prebuiltLayers = useMemo(
    () =>
      LAYERS.map((layer, li) => ({
        ...layer,
        dots: buildLayerDots(layer.spacing).map((dot, di) => ({
          ...dot,
          points: hexPointsAt(dot.x + 60, dot.y + 60, layer.dotSize),
          fill: getDotColor(di + li * 13, layer.z),
        })),
      })),
    []
  );

  useEffect(() => {
    let animFrame = 0;
    let sub: { remove: () => void } | null = null;
    let active = true;

    (async () => {
      try {
        await Gyroscope.setUpdateInterval(GYRO_INTERVAL_MS);
        sub = Gyroscope.addListener(({ x, y }) => {
          const now = Date.now();
          const dt = lastTs.current ? Math.min((now - lastTs.current) / 1000, 0.08) : 0.032;
          lastTs.current = now;
          gyroAngle.current.x = Math.max(
            -MAX_TILT,
            Math.min(MAX_TILT, gyroAngle.current.x + y * dt * 60)
          );
          gyroAngle.current.y = Math.max(
            -MAX_TILT,
            Math.min(MAX_TILT, gyroAngle.current.y - x * dt * 60)
          );
        });
      } catch {
        // Sin giroscopio el fondo sigue estático y no rompe la app
      }
    })();

    const loop = () => {
      if (!active) return;
      const lerp = 0.1;
      smoothAngle.current.x += (gyroAngle.current.x - smoothAngle.current.x) * lerp;
      smoothAngle.current.y += (gyroAngle.current.y - smoothAngle.current.y) * lerp;
      LAYERS.forEach((layer, i) => {
        layerTranslates[i].x.setValue(smoothAngle.current.x * layer.parallax);
        layerTranslates[i].y.setValue(smoothAngle.current.y * layer.parallax);
      });
      animFrame = requestAnimationFrame(loop);
    };
    animFrame = requestAnimationFrame(loop);

    return () => {
      active = false;
      sub?.remove();
      cancelAnimationFrame(animFrame);
    };
  }, [layerTranslates]);

  return (
    <>
      <View style={styles.bg0} />
      <View style={styles.bg1} />
      <View style={styles.bg2} />

      {prebuiltLayers.map((layer, li) => (
        <Animated.View
          key={`bg-layer-${li}`}
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [
                { translateX: layerTranslates[li].x },
                { translateY: layerTranslates[li].y },
              ],
            },
          ]}
          pointerEvents="none"
          renderToHardwareTextureAndroid
          shouldRasterizeIOS
        >
          <Svg
            width={LAYER_W}
            height={LAYER_H}
            style={{ position: 'absolute', left: -60, top: -60 }}
          >
            {layer.dots.map((dot, di) => (
              <Polygon key={`dot-${li}-${di}`} points={dot.points} fill={dot.fill} />
            ))}
          </Svg>
        </Animated.View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  bg0: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0f0f0f',
  },
  bg1: {
    position: 'absolute',
    left: width * 0.5 - 160,
    top: height * 0.4 - 160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(51, 116, 24, 0.12)',
  },
  bg2: {
    position: 'absolute',
    left: width * 0.5 - 110,
    top: height * 0.4 - 110,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(93, 214, 44, 0.07)',
  },
});
