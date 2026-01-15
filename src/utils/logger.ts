export const logger = {
  info(message: string): void {
    console.log(`[CodeQuickSelect] ${message}`);
  },
  warn(message: string): void {
    console.warn(`[CodeQuickSelect] ${message}`);
  },
  error(message: string): void {
    console.error(`[CodeQuickSelect] ${message}`);
  }
};
