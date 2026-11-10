let isProfileDirty = false;
let resetProfileFn: (() => void) | null = null;

export function setProfileDirtyState(dirty: boolean, reset?: () => void) {
  isProfileDirty = dirty;
  if (reset) {
    resetProfileFn = reset;
  }
}

export function getProfileDirtyState(): boolean {
  return isProfileDirty;
}

export function resetProfileDirtyState() {
  isProfileDirty = false;
  if (resetProfileFn) {
    resetProfileFn();
  }
}