declare module 'fingerpose' {
    export class GestureEstimator {
        constructor(knownGestures: GestureDescription[]);
        estimate(landmarks: number[][], minScore: number): Promise<{
            gestures: { name: string; score: number }[];
            poseData: any;
        }>;
    }

    export class GestureDescription {
        constructor(name: string);
        addCurl(finger: number, curl: number, contribution: number): void;
        addDirection(finger: number, direction: number, contribution: number): void;
    }

    export const Finger: {
        Thumb: number;
        Index: number;
        Middle: number;
        Ring: number;
        Pinky: number;
    };

    export const FingerCurl: {
        NoCurl: number;
        HalfCurl: number;
        FullCurl: number;
    };

    export const FingerDirection: {
        VerticalUp: number;
        VerticalDown: number;
        HorizontalLeft: number;
        HorizontalRight: number;
        DiagonalUpLeft: number;
        DiagonalUpRight: number;
        DiagonalDownLeft: number;
        DiagonalDownRight: number;
    };
}
