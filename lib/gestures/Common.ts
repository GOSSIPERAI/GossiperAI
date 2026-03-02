import { Finger, FingerCurl, FingerDirection, GestureDescription } from 'fingerpose';

// Thumbs Up
export const thumbsUp = new GestureDescription('thumbs_up');

// Thumb: No curl, Vertical Up
thumbsUp.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
thumbsUp.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
thumbsUp.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.25);
thumbsUp.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.25);

// All other fingers: Full Curl
for (let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
    thumbsUp.addCurl(finger, FingerCurl.FullCurl, 1.0);
    thumbsUp.addCurl(finger, FingerCurl.HalfCurl, 0.9);
}

// Victory (Same as V essentially, but named differently for semantics)
export const victory = new GestureDescription('victory');
victory.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
victory.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
victory.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
victory.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
for (let finger of [Finger.Ring, Finger.Pinky, Finger.Thumb]) {
    victory.addCurl(finger, FingerCurl.FullCurl, 1.0);
    victory.addCurl(finger, FingerCurl.HalfCurl, 0.9);
}

// Hello (Open Palm / Waving Proxy)
export const hello = new GestureDescription('hello');

// All fingers straight up
for (let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
    hello.addCurl(finger, FingerCurl.NoCurl, 1.0);
    hello.addDirection(finger, FingerDirection.VerticalUp, 1.0);
    hello.addDirection(finger, FingerDirection.DiagonalUpRight, 0.8);
    hello.addDirection(finger, FingerDirection.DiagonalUpLeft, 0.8);
}

// Thumb is also straight but usually points diagonally
hello.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
hello.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 1.0);
hello.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 1.0);
hello.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.8);
hello.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.8);

export const commonGestures = [thumbsUp, victory, hello];
