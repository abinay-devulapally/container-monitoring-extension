const DockerAlertHandler = require("./dockerAlertHandler_RESTAPI");
const DockerEventHandler = require("../healthmonitor/dockerEventHandler");

const queue = [];

const alertHandler = new DockerAlertHandler(queue);
const eventHandler = new DockerEventHandler(queue);

alertHandler.run();
eventHandler.run();
