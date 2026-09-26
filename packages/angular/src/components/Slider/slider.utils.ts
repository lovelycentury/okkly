// The slider maths of `@okkly/react-hooks`' `useSlider`, kept line for line so
// the two packages snap, round and clamp alike.

export const clamp = (number: number, min: number, max: number) =>
  Math.max(Math.min(number, max), min);

const decimalsCount = (number: number) => String(number).split(".")[1]?.length ?? 0;

export const valueToPercent = (value: number, min: number, max: number) =>
  ((value - min) * 100) / (max - min);

export const percentToValue = (percent: number, min: number, max: number) =>
  (max - min) * percent + min;

export const roundToStep = (value: number, step: number, min: number) =>
  Number((Math.round((value - min) / step) * step + min).toFixed(decimalsCount(step)));

export const areArraysEqual = (arrayA: readonly number[], arrayB: readonly number[]) =>
  arrayA.length === arrayB.length && arrayA.every((value, index) => value === arrayB[index]);

export const normalizeValues = (
  values: readonly number[],
  min: number,
  max: number,
  step: number,
): number[] => {
  if (!values.length) return [min];
  return values
    .map((value) => roundToStep(clamp(value, min, max), step, min))
    .toSorted((a, b) => a - b);
};

export const findClosestIndex = (values: readonly number[], currentValue: number) => {
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;
  values.forEach((value, index) => {
    const distance = Math.abs(currentValue - value);
    if (distance <= closestDistance) {
      closestIndex = index;
      closestDistance = distance;
    }
  });
  return closestIndex;
};

export const adjustValueByIndex = (values: readonly number[], newValue: number, index: number) =>
  values.map((value, i) => (i === index ? newValue : value)).toSorted((a, b) => a - b);

export const valueToArray = (value: number | readonly number[]) =>
  Array.isArray(value) ? [...value] : [value as number];

export const isFocusVisible = (element: Element): boolean => {
  try {
    return element.matches(":focus-visible");
  } catch {
    return false;
  }
};
