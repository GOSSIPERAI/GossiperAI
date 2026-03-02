import { Finger, FingerCurl, FingerDirection, GestureDescription } from 'fingerpose';

// --- A ---
// Fist with thumb on side
export const aSign = new GestureDescription('A');
// Thumb: Straight, Vertical
aSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
aSign.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
// Others: Full Curl
for (let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
    aSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
    aSign.addCurl(finger, FingerCurl.HalfCurl, 0.9); // Allow some leeway
}

// --- B ---
// Open palm, thumb tucked
export const bSign = new GestureDescription('B');
bSign.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
bSign.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.9);
for (let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
    bSign.addCurl(finger, FingerCurl.NoCurl, 1.0);
    bSign.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}

// --- C ---
// Curved hand
export const cSign = new GestureDescription('C');
for (let finger of [Finger.Thumb, Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
    cSign.addCurl(finger, FingerCurl.HalfCurl, 1.0);
    cSign.addCurl(finger, FingerCurl.NoCurl, 0.5); // Provide range
}

// --- D ---
// Index up, others curled/touching thumb
export const dSign = new GestureDescription('D');
dSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
dSign.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
for (let finger of [Finger.Thumb, Finger.Middle, Finger.Ring, Finger.Pinky]) {
    dSign.addCurl(finger, FingerCurl.HalfCurl, 0.9);
    dSign.addCurl(finger, FingerCurl.FullCurl, 0.9);
}

// --- E ---
// All fingers curled
export const eSign = new GestureDescription('E');
for (let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky, Finger.Thumb]) {
    eSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
    eSign.addCurl(finger, FingerCurl.HalfCurl, 0.9);
}

// --- F ---
// OK sign
export const fSign = new GestureDescription('F');
fSign.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0); // Touching thumb
fSign.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
for (let finger of [Finger.Middle, Finger.Ring, Finger.Pinky]) {
    fSign.addCurl(finger, FingerCurl.NoCurl, 1.0);
    fSign.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}

// --- G ---
// Pointing sideways with Index and Thumb
export const gSign = new GestureDescription('G');
gSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
gSign.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 1.0);
gSign.addDirection(Finger.Index, FingerDirection.HorizontalRight, 1.0);
gSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
for (let finger of [Finger.Middle, Finger.Ring, Finger.Pinky]) {
    gSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}

// --- H ---
// Index and Middle sideways
export const hSign = new GestureDescription('H');
hSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
hSign.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
hSign.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 0.9);
hSign.addDirection(Finger.Index, FingerDirection.HorizontalRight, 0.9);
for (let finger of [Finger.Ring, Finger.Pinky, Finger.Thumb]) {
    hSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}

// --- I ---
// Pinky up
export const iSign = new GestureDescription('I');
iSign.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
iSign.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);
for (let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Thumb]) {
    iSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
    iSign.addCurl(finger, FingerCurl.HalfCurl, 0.9);
}

// --- L ---
// L shape
export const lSign = new GestureDescription('L');
lSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
lSign.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
lSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
for (let finger of [Finger.Middle, Finger.Ring, Finger.Pinky]) {
    lSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}

// --- O ---
// O shape
export const oSign = new GestureDescription('O');
for (let finger of [Finger.Thumb, Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
    oSign.addCurl(finger, FingerCurl.HalfCurl, 1.0);
    oSign.addCurl(finger, FingerCurl.FullCurl, 0.5);
}

// --- U ---
// Index and Middle up together
export const uSign = new GestureDescription('U');
uSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
uSign.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
uSign.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
uSign.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
for (let finger of [Finger.Ring, Finger.Pinky, Finger.Thumb]) {
    uSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
    uSign.addCurl(finger, FingerCurl.HalfCurl, 0.9);
}

// --- V ---
// Victory / Peace
export const vSign = new GestureDescription('V');
vSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
vSign.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
vSign.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
vSign.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
// Separation check is harder, but simplified here
for (let finger of [Finger.Ring, Finger.Pinky, Finger.Thumb]) {
    vSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
    vSign.addCurl(finger, FingerCurl.HalfCurl, 0.9);
}

// --- Y ---
// Hang loose / Y
export const ySign = new GestureDescription('Y');
ySign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
ySign.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
for (let finger of [Finger.Index, Finger.Middle, Finger.Ring]) {
    ySign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}

export const alphabets = [
    aSign, bSign, cSign, dSign, eSign, fSign, gSign, hSign, iSign, lSign, oSign, uSign, vSign, ySign
];
