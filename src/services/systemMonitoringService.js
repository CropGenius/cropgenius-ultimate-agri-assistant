const analytics = require('../integrations/analytics');
const supabase = require('../integrations/supabase/client');
const security = require('./securityService');

class SystemMonitor {
  constructor() {
    this.metrics = {
      responseTime: 0,
      memoryUsage: 0,
      activeUsers: 0,
      databaseConnections: 0,
      errorRate: 0
    };
    this.healthChecks = [];
    this.errorLog = [];
    this.lastCheck = 0;
    this.checkInterval = 10000; // 10 seconds
  }

  async startMonitoring() {
    this.healthChecks = [
      this.checkResponseTime,
      this.checkMemoryUsage,
      this.checkActiveUsers,
      this.checkDatabaseConnections,
      this.checkErrorRate
    ];

    setInterval(async () => {
      await this.runHealthChecks();
    }, this.checkInterval);
  }

  async runHealthChecks() {
    const now = Date.now();
    if (now - this.lastCheck < this.checkInterval) return;

    this.lastCheck = now;
    
    for (const check of this.healthChecks) {
      try {
        await check();
      } catch (error) {
        this.logError(error);
      }
    }

    // Log metrics
    analytics.track('system_metrics', {
      ...this.metrics,
      timestamp: now
    });
  }

  async checkResponseTime() {
    const response = await fetch(`${process.env.VITE_API_BASE_URL}/health`);
    const time = response.headers.get('x-response-time');
    this.metrics.responseTime = time ? parseInt(time) : 0;
  }

  async checkMemoryUsage() {
    this.metrics.memoryUsage = process.memoryUsage().heapUsed;
  }

  async checkActiveUsers() {
    const { data, error } = await supabase
      .from('active_sessions')
      .select('id')
      .eq('status', 'active');

    if (error) throw error;
    this.metrics.activeUsers = data.length;
  }

  async checkDatabaseConnections() {
    const { data, error } = await supabase
      .rpc('get_database_connections');

    if (error) throw error;
    this.metrics.databaseConnections = data;
  }

  async checkErrorRate() {
    const { data, error } = await supabase
      .from('error_logs')
      .select('id')
      .gte('timestamp', Date.now() - 60000) // Last minute
      .count();

    if (error) throw error;
    this.metrics.errorRate = data[0].count / 60; // Errors per second
  }

  logError(error) {
    this.errorLog.push({
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack
    });

    analytics.track('system_error', {
      error: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });
  }

  async getSystemHealth() {
    return {
      status: this.getStatus(),
      metrics: this.metrics,
      lastCheck: this.lastCheck,
      errorLog: this.errorLog
    };
  }

  getStatus() {
    const thresholds = {
      responseTime: 1500,
      memoryUsage: 50 * 1024 * 1024,
      activeUsers: 50000,
      databaseConnections: 100,
      errorRate: 0.01
    };

    const violations = Object.entries(this.metrics)
      .filter(([key, value]) => value > thresholds[key])
      .map(([key]) => key);

    if (violations.length > 0) {
      return 'WARNING';
    }

    return 'HEALTHY';
  }

  async triggerEmergencyShutdown() {
    try {
      // Log emergency shutdown
      analytics.track('emergency_shutdown', {
        reason: 'system_health_violation',
        timestamp: Date.now()
      });

      // Save current state
      await supabase.rpc('save_system_state');

      // Trigger rollback
      await supabase.rpc('trigger_rollback');

      // Notify team
      await this.notifyTeam('Emergency shutdown triggered');
    } catch (error) {
      this.logError(error);
    }
  }

  async notifyTeam(message) {
    try {
      // Send Slack notification
      await fetch(`${process.env.VITE_SLACK_WEBHOOK}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 ${message}\n\nTime: ${new Date().toISOString()}\nEnvironment: ${process.env.MODE}\nStatus: ${this.getStatus()}`
        })
      });

      // Send email notification
      await fetch(`${process.env.VITE_EMAIL_WEBHOOK}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: process.env.VITE_SUPPORT_EMAIL,
          subject: 'Emergency Notification',
          body: `Emergency notification: ${message}\n\nEnvironment: ${process.env.MODE}\nTime: ${new Date().toISOString()}`
        })
      });
    } catch (error) {
      this.logError(error);
    }
  }
}

module.exports.systemMonitor = new SystemMonitor();
