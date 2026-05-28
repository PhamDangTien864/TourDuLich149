import { prisma } from '@/lib/prisma';
import { ErrorHandler } from './errors';

export enum ActivityType {
  TOUR_CREATE = 'TOUR_CREATE',
  TOUR_UPDATE = 'TOUR_UPDATE',
  TOUR_DELETE = 'TOUR_DELETE',
  BOOKING_CONFIRM = 'BOOKING_CONFIRM',
  BOOKING_CANCEL = 'BOOKING_CANCEL',
  CUSTOMER_CREATE = 'CUSTOMER_CREATE',
  CUSTOMER_UPDATE = 'CUSTOMER_UPDATE',
  CUSTOMER_DELETE = 'CUSTOMER_DELETE',
  PROMOTION_CREATE = 'PROMOTION_CREATE',
  PROMOTION_UPDATE = 'PROMOTION_UPDATE',
  PROMOTION_DELETE = 'PROMOTION_DELETE',
  REVIEW_REPLY = 'REVIEW_REPLY',
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
  EXPORT_DATA = 'EXPORT_DATA',
  IMPORT_DATA = 'IMPORT_DATA'
}

export interface ActivityLogData {
  userId?: number;
  action: ActivityType;
  entityType: string;
  entityId?: number;
  oldValues?: string;
  newValues?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class ActivityLogger {
  /**
   * Log an admin activity using existing audit_logs table
   */
  static async log(data: ActivityLogData) {
    try {
      await prisma.audit_logs.create({
        data: {
          user_id: data.userId,
          action: data.action,
          entity_type: data.entityType,
          entity_id: data.entityId,
          old_values: data.oldValues,
          new_values: data.newValues,
          ip_address: data.ipAddress,
          user_agent: data.userAgent
        }
      });
    } catch (error) {
      ErrorHandler.log(ErrorHandler.handle(error), 'Error logging activity');
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Get recent activities for a user
   */
  static async getUserActivities(userId: number, limit = 50) {
    return prisma.audit_logs.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit
    });
  }

  /**
   * Get all recent activities (for admin dashboard)
   */
  static async getRecentActivities(limit = 20) {
    return prisma.audit_logs.findMany({
      orderBy: { created_at: 'desc' },
      take: limit
    });
  }

  /**
   * Get activities by type
   */
  static async getActivitiesByType(action: ActivityType, limit = 50) {
    return prisma.audit_logs.findMany({
      where: { action },
      orderBy: { created_at: 'desc' },
      take: limit
    });
  }

  /**
   * Get activities by entity
   */
  static async getActivitiesByEntity(entityType: string, entityId: number, limit = 50) {
    return prisma.audit_logs.findMany({
      where: {
        entity_type: entityType,
        entity_id: entityId
      },
      orderBy: { created_at: 'desc' },
      take: limit
    });
  }

  /**
   * Get activity statistics
   */
  static async getActivityStats() {
    const [totalActivities, todayActivities, activitiesByType, topUsers] = await Promise.all([
      prisma.audit_logs.count(),
      prisma.audit_logs.count({
        where: {
          created_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.audit_logs.groupBy({
        by: ['action'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      }),
      prisma.audit_logs.groupBy({
        by: ['user_id'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5
      })
    ]);

    return {
      totalActivities,
      todayActivities,
      activitiesByType,
      topUsers
    };
  }

  /**
   * Clean up old activity logs (older than 90 days)
   */
  static async cleanupOldLogs() {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    const result = await prisma.audit_logs.deleteMany({
      where: {
        created_at: { lt: ninetyDaysAgo }
      }
    });

    return result.count;
  }
}

/**
 * Helper function to log tour activities
 */
export async function logTourActivity(userId: number, action: 'CREATE' | 'UPDATE' | 'DELETE', tourId: number, tourName: string, details?: string) {
  const actionMap = {
    'CREATE': ActivityType.TOUR_CREATE,
    'UPDATE': ActivityType.TOUR_UPDATE,
    'DELETE': ActivityType.TOUR_DELETE
  };

  await ActivityLogger.log({
    userId,
    action: actionMap[action],
    entityType: 'Tour',
    entityId: tourId,
    newValues: details || tourName
  });
}

/**
 * Helper function to log booking activities
 */
export async function logBookingActivity(userId: number, action: 'CONFIRM' | 'CANCEL', bookingId: number, customerName: string, details?: string) {
  const actionMap = {
    'CONFIRM': ActivityType.BOOKING_CONFIRM,
    'CANCEL': ActivityType.BOOKING_CANCEL
  };

  await ActivityLogger.log({
    userId,
    action: actionMap[action],
    entityType: 'Booking',
    entityId: bookingId,
    newValues: details || `Booking #${bookingId} - ${customerName}`
  });
}

/**
 * Helper function to log customer activities
 */
export async function logCustomerActivity(userId: number, action: 'CREATE' | 'UPDATE' | 'DELETE', customerId: number, customerName: string, details?: string) {
  const actionMap = {
    'CREATE': ActivityType.CUSTOMER_CREATE,
    'UPDATE': ActivityType.CUSTOMER_UPDATE,
    'DELETE': ActivityType.CUSTOMER_DELETE
  };

  await ActivityLogger.log({
    userId,
    action: actionMap[action],
    entityType: 'Customer',
    entityId: customerId,
    newValues: details || customerName
  });
}
