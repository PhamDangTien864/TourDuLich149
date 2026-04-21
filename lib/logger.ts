type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  userId?: number;
  requestId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, userId, requestId } = entry;
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    const userStr = userId ? ` | User: ${userId}` : '';
    const requestStr = requestId ? ` | Request: ${requestId}` : '';
    
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}${userStr}${requestStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, userId?: number, requestId?: string) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId,
      requestId
    };

    const formattedLog = this.formatLog(entry);

    if (this.isDevelopment) {
      // In development, use console.log for better debugging
      switch (level) {
        case 'error':
          console.error(formattedLog);
          break;
        case 'warn':
          console.warn(formattedLog);
          break;
        case 'debug':
          console.debug(formattedLog);
          break;
        default:
          console.log(formattedLog);
      }
    } else {
      // In production, you might want to send to a logging service
      // For now, we'll still use console but with structured format
      console.log(JSON.stringify(entry));
    }
  }

  info(message: string, context?: Record<string, unknown>, userId?: number, requestId?: string) {
    this.log('info', message, context, userId, requestId);
  }

  warn(message: string, context?: Record<string, unknown>, userId?: number, requestId?: string) {
    this.log('warn', message, context, userId, requestId);
  }

  error(message: string, context?: Record<string, unknown>, userId?: number, requestId?: string) {
    this.log('error', message, context, userId, requestId);
  }

  debug(message: string, context?: Record<string, unknown>, userId?: number, requestId?: string) {
    this.log('debug', message, context, userId, requestId);
  }

  // API specific logging methods
  apiError(method: string, endpoint: string, error: Error, userId?: number) {
    this.error(`API Error: ${method} ${endpoint}`, {
      error: error.message,
      stack: error.stack,
      method,
      endpoint
    }, userId);
  }

  apiRequest(method: string, endpoint: string, userId?: number) {
    this.info(`API Request: ${method} ${endpoint}`, { method, endpoint }, userId);
  }

  authEvent(event: string, userId?: number, context?: Record<string, unknown>) {
    this.info(`Auth Event: ${event}`, context, userId);
  }

  dbQuery(operation: string, table: string, duration?: number) {
    this.debug(`DB Query: ${operation} on ${table}`, { operation, table, duration });
  }
}

export const logger = new Logger();
