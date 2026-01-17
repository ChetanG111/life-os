import { useMotion } from '@/context/MotionContext';

export function useSlimySpring() {
    const { getSpring } = useMotion();
    return getSpring();
}
