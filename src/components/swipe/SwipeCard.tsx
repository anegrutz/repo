import { useEffect } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { DiscoveryCard } from '@/features/matching/api';

export type SwipeOutcome = 'right' | 'left' | 'up';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const VELOCITY_THRESHOLD = 600;

type Props = {
  card: DiscoveryCard;
  isTop: boolean;
  onSwiped: (outcome: SwipeOutcome) => void;
};

export function SwipeCard({ card, isTop, onSwiped }: Props) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const stackOffset = useSharedValue(isTop ? 0 : 1);

  useEffect(() => {
    stackOffset.value = withTiming(isTop ? 0 : 1, { duration: 200 });
  }, [isTop, stackOffset]);

  const fly = (outcome: SwipeOutcome) => {
    'worklet';
    const target =
      outcome === 'right'
        ? { x: SCREEN_WIDTH * 1.5, y: ty.value }
        : outcome === 'left'
          ? { x: -SCREEN_WIDTH * 1.5, y: ty.value }
          : { x: tx.value, y: -SCREEN_HEIGHT };
    tx.value = withTiming(target.x, { duration: 220 });
    ty.value = withTiming(target.y, { duration: 220 }, (done) => {
      if (done) runOnJS(onSwiped)(outcome);
    });
  };

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY < -SWIPE_THRESHOLD || e.velocityY < -VELOCITY_THRESHOLD) {
        fly('up');
      } else if (e.translationX > SWIPE_THRESHOLD || e.velocityX > VELOCITY_THRESHOLD) {
        fly('right');
      } else if (e.translationX < -SWIPE_THRESHOLD || e.velocityX < -VELOCITY_THRESHOLD) {
        fly('left');
      } else {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(tx.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-12, 0, 12]);
    const scale = interpolate(stackOffset.value, [0, 1], [1, 0.94]);
    const yOffset = interpolate(stackOffset.value, [0, 1], [0, 12]);
    return {
      transform: [
        { translateX: tx.value },
        { translateY: ty.value + yOffset },
        { rotate: `${rotate}deg` },
        { scale },
      ],
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [0, SWIPE_THRESHOLD], [0, 1], 'clamp'),
  }));
  const passOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-SWIPE_THRESHOLD, 0], [1, 0], 'clamp'),
  }));
  const hotboxOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(ty.value, [-SWIPE_THRESHOLD, 0], [1, 0], 'clamp'),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        className="absolute inset-0 overflow-hidden rounded-3xl bg-bg-card"
        style={animatedStyle}
      >
        <View className="flex-1 justify-end p-6">
          <Text className="text-leaf-400 text-3xl font-bold">{card.displayName}</Text>
          <Text className="text-haze-200 mt-1 text-sm">
            {card.vibe === 'indica' ? 'Team Indica' : 'Team Sativa'} •{' '}
            {card.munchies.slice(0, 2).join(', ')}
          </Text>
          {card.bio ? (
            <Text className="text-haze-400 mt-2 text-sm" numberOfLines={3}>
              {card.bio}
            </Text>
          ) : null}
        </View>

        <Animated.View
          className="border-leaf-500 absolute left-6 top-12 rounded-xl border-4 px-3 py-1"
          style={likeOpacity}
        >
          <Text className="text-leaf-400 text-xl font-extrabold">PASS</Text>
        </Animated.View>
        <Animated.View
          className="absolute right-6 top-12 rounded-xl border-4 border-ember-500 px-3 py-1"
          style={passOpacity}
        >
          <Text className="text-xl font-extrabold text-ember-500">ASH</Text>
        </Animated.View>
        <Animated.View
          className="absolute left-1/2 top-6 -translate-x-12 rounded-xl border-4 border-ember-400 px-4 py-1"
          style={hotboxOpacity}
        >
          <Text className="text-xl font-extrabold text-ember-400">HOTBOX</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
