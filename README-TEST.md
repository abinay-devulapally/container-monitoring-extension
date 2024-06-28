# Container Monitoring Extension

Welcome to the Container Monitoring Extension for Visual Studio Code! This extension helps you monitor the health and status of your Docker containers directly from your VS Code environment.

## Features

- **Real-Time Alerts**: Receive real-time alerts for container health checks.
- **Notifications**: Get notifications for warnings and errors with container health.
- **Automatic Clear Alerts**: Automatically clear notifications when containers are healthy again.

![Alert Notification](images/alert-notification.png)
_Example of an alert notification._

![Warning Notification](images/warning-notification.png)
_Example of a warning notification._

> Tip: Use animations to show the extension in action. A brief, focused animation can be very effective.

## Requirements

- **Docker**: Ensure Docker is installed and running on your system.
- **DockerHealthCheck**: Ensure Docker HealthCheck is enabled.
- **Dockerode**: The extension depends on the Dockerode Node.js library. Install it via npm:

  ```sh
  npm install dockerode
  ```

## Extension Settings

This extension contributes the following settings:

- `containerMonitoring.enable`: Enable or disable the container monitoring extension.
- `containerMonitoring.pollInterval`: Set the interval (in milliseconds) for polling container statuses.

## Known Issues

- **Performance**: Monitoring a large number of containers may impact performance.
- **Compatibility**: Currently, the extension is tested with Docker version X.X.X.

## Release Notes

### 1.0.0

Initial release of Container Monitoring Extension.
