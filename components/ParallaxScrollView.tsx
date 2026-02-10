import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  forceColorScheme?: 'light' | 'dark';
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  forceColorScheme,
}: Props) {
  const systemColorScheme = useColorScheme() ?? 'light';
  const colorScheme = forceColorScheme || systemColorScheme;
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <ThemedView 
      style={styles.container} 
      lightColor="#FAFBFC" 
      darkColor={forceColorScheme === 'light' ? "#FAFBFC" : "#1A1D23"}
    >
      <Animated.ScrollView 
        ref={scrollRef} 
        scrollEventThrottle={16} 
        style={{ 
          backgroundColor: forceColorScheme === 'light' ? '#FAFBFC' : (colorScheme === 'light' ? '#FAFBFC' : '#1A1D23')
        }}
      >
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle,
          ]}>
          {headerImage}
        </Animated.View>
        <ThemedView 
          style={styles.content} 
          lightColor="#FAFBFC" 
          darkColor={forceColorScheme === 'light' ? "#FAFBFC" : "#1A1D23"}
        >
          {children}
        </ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 250,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});
