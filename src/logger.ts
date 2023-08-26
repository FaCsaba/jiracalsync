import { LogType } from "./models/log_type.model";

function log(componentName: string, logType: LogType, event: string) {
  switch (logType) {
    case LogType.Ok:
      process.stdout.write("\x1b[32m");
      break;
    case LogType.Error:
      process.stdout.write("\x1b[31m");
  }
  console.log(`[${new Date().toISOString()}][${componentName}][${logType}] ${event}`)
  process.stdout.write("\x1b[0m");
}

export type Logger = (logType: LogType, event: string) => void;

export function loggerFactory(componentName: string): Logger {
  return (logType: LogType, event: string) => log(componentName, logType, event);
}