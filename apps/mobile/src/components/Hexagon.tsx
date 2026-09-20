import { ReactNode, useMemo, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { ClipPath, Defs, Image as SvgImage, Polygon } from 'react-native-svg';

function flatTopPoints(w: number, h: number, inset = 0) {
  return [
    [w * 0.25, inset],
    [w * 0.75, inset],
    [w - inset, h / 2],
    [w * 0.75, h - inset],
    [w * 0.25, h - inset],
    [inset, h / 2],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
}

function horizontalHexPoints(w: number, h: number, inset = 0) {
  const cut = h * 0.42;
  return [
    [cut, inset],
    [w - cut, inset],
    [w - inset, h / 2],
    [w - cut, h - inset],
    [cut, h - inset],
    [inset, h / 2],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
}

/** Hexágono regular simétrico (flat-top). */
export function Hexagon({
  size,
  fill,
  stroke,
  strokeWidth = 1,
  style,
  children,
}: {
  size: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const w = size;
  const h = (size * Math.sqrt(3)) / 2;
  const points = flatTopPoints(w, h, strokeWidth / 2);

  return (
    <View style={[{ width: w, height: h, alignItems: 'center', justifyContent: 'center' }, style]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={w} height={h}>
          <Polygon
            points={points}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </Svg>
      </View>
      {children}
    </View>
  );
}

/** Imagen recortada en hexágono simétrico. */
export function HexImage({
  size,
  source,
  stroke = 'rgba(192, 193, 255, 0.3)',
  strokeWidth = 1,
  style,
}: {
  size: number;
  source: ImageSourcePropType;
  stroke?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const clipId = useMemo(() => `heximg-${Math.random().toString(36).slice(2, 9)}`, []);
  const w = size;
  const h = (size * Math.sqrt(3)) / 2;
  const points = flatTopPoints(w, h, strokeWidth / 2);
  const resolved = Image.resolveAssetSource(source);
  const href = resolved?.uri ?? source;

  return (
    <View style={[{ width: w, height: h }, style]}>
      <Svg width={w} height={h}>
        <Defs>
          <ClipPath id={clipId}>
            <Polygon points={flatTopPoints(w, h, 0)} />
          </ClipPath>
        </Defs>
        <SvgImage
          href={{ uri: typeof href === 'string' ? href : String(href) }}
          width={w}
          height={h}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
        <Polygon
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </Svg>
    </View>
  );
}

/** Hexágono horizontal alargado (reemplazo de píldora). */
export function HexPill({
  fill,
  stroke,
  strokeWidth = 1,
  height = 26,
  paddingHorizontal = 12,
  style,
  contentStyle,
  children,
}: {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  height?: number;
  paddingHorizontal?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const next = Math.round(e.nativeEvent.layout.width);
    if (next > 0 && Math.abs(next - width) >= 2) setWidth(next);
  };

  const points =
    width > height * 0.84
      ? horizontalHexPoints(width, height, strokeWidth / 2)
      : '';

  return (
    <View style={[{ height, alignSelf: 'flex-start' }, style]} onLayout={onLayout}>
      {width > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width={width} height={height}>
            <Polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </Svg>
        </View>
      )}
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: paddingHorizontal + 2,
            height,
            gap: 6,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

/** Barra hexagonal horizontal a ancho completo (header / dock). */
export function HexBar({
  height,
  fill,
  stroke,
  strokeWidth = 1,
  style,
  contentStyle,
  children,
}: {
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const next = Math.round(e.nativeEvent.layout.width);
    if (next > 0 && Math.abs(next - width) >= 2) setWidth(next);
  };

  const points =
    width > height
      ? horizontalHexPoints(width, height, strokeWidth / 2)
      : '';

  return (
    <View style={[{ height, width: '100%' }, style]} onLayout={onLayout}>
      {width > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width={width} height={height}>
            <Polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </Svg>
        </View>
      )}
      <View
        style={[
          {
            flex: 1,
            height,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: Math.max(18, height * 0.35),
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export { flatTopPoints };
