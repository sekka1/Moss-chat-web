/**
 * PM2 Ecosystem Configuration
 * https://pm2.keymetrics.io/docs/usage/application-declaration/
 */
module.exports = {
  apps: [
    {
      name: 'moss-chat',
      script: 'dist/server.js',
      cwd: '/opt/bitnami/apps/moss-chat',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Logging
      error_file: '/opt/bitnami/apps/moss-chat/logs/error.log',
      out_file: '/opt/bitnami/apps/moss-chat/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Restart settings
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      restart_delay: 1000,
    },
  ],
};
