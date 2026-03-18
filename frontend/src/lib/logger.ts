type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  import.meta.env.MODE === 'production' ? 'warn' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatEntry(entry: LogEntry): string {
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.context}] ${entry.message}`;
}

function createEntry(
  level: LogLevel,
  context: string,
  message: string,
  data?: unknown,
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    data,
  };
}

function emit(entry: LogEntry): void {
  const formatted = formatEntry(entry);
  const consoleFn = entry.level === 'debug' ? console.debug
    : entry.level === 'info' ? console.info
    : entry.level === 'warn' ? console.warn
    : console.error;

  if (entry.data !== undefined) {
    consoleFn(formatted, entry.data);
  } else {
    consoleFn(formatted);
  }
}

export interface Logger {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

export function createLogger(context: string): Logger {
  const log = (level: LogLevel) => (message: string, data?: unknown) => {
    if (!shouldLog(level)) return;
    emit(createEntry(level, context, message, data));
  };

  return {
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
  };
}
