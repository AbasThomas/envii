export const CLI_PIN_REGEX = /^\d{6}$/;

export function isValidCliPin(pin: string | null | undefined): pin is string {
  return typeof pin === "string" && CLI_PIN_REGEX.test(pin);
}

export function generateCliPin() {
  const value = Math.floor(Math.random() * 1_000_000);
  return value.toString().padStart(6, "0");
}
