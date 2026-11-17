module.exports = {
  apps: [
    {
      name: "ec2-task-tracker",
      script: "./server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false
    }
  ]
};
