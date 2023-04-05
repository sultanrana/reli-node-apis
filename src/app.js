import express from "express";
import chalk from "chalk";
import { restRouter } from "./base/index";
import { configureDb } from "./config/db.js";
import { setGlobalmiddleware } from "./middlewares/global-middleware";
import path from "path";
import OrderModel from "./models/order.model";
import AssignedOrderModal from "./models/assignedOrder.model";
import UsersModal from "./models/user.model";
const FCM = require("./libraries/notifications.js");
var cron = require("node-cron");
import NotificationModel from "./models/notification.model";
configureDb();

const app = express();

app.use(express.static(path.join(__dirname, "uploads/images")));

// REGISTER  GLOBAL MIDDLEWAREs
setGlobalmiddleware(app);

const task = cron.schedule("10 * * * * *", async () => {
  const Users = await UsersModal.find({ userType: "contractor" });
  const Orders = await OrderModel.find({});
  const AssignedOrders = await AssignedOrderModal.find({}).populate(
    "order userBy userTo"
  );
  for (let index = 0; index < Orders.length; index++) {
    const order = Orders[index];
    const currentDate = new Date(Date.now());
    const maxDate = new Date(
      Math.max(
        ...order.dateSelection.map((element) => {
          return new Date(element);
        })
      )
    );
    const minDate = new Date(
      Math.min(
        ...order.dateSelection.map((element) => {
          return new Date(element);
        })
      )
    );
    // Late to Project
    if (
      order.requestStatus == "Accepted" &&
      maxDate < currentDate &&
      order.orderStatus !== "Completed"
    ) {
      for (let index = 0; index < Users.length; index++) {
        const User = Users[index];
        if (
          User.fcmToken !== null &&
          User.fcmToken !== undefined &&
          User.fcmToken !== ""
        ) {
          FCM.push_notification(
            "Running late!",
            `Project ${order._id} was supposed to start at Project Scheduled Date project
            start time.`,
            User.fcmToken,
            12
          );
          const notificationModel = new NotificationModel();
          notificationModel.user = mongoose.Types.ObjectId(User._id);
          notificationModel.title = "Running late!";
          notificationModel.body = `Project ${order._id} was supposed to start at Project Scheduled Date project
          start time.`;
          notificationModel.type = "Late to Project";
          notificationModel.deviceToken = User.fcmToken;
          notificationModel.save();
        }
      }
    }
    // Project starts soon
    if (
      order.requestStatus !== "Accepted" &&
      minDate < currentDate &&
      maxDate > currentDate
    ) {
      for (let index = 0; index < Users.length; index++) {
        const User = Users[index];
        if (
          User.fcmToken !== null &&
          User.fcmToken !== undefined &&
          User.fcmToken !== ""
        ) {
          FCM.push_notification(
            `Your project ${order._id} Starts Soon`,
            `Project ${order._id} was supposed to start at Project Scheduled Date project
            start time.`,
            User.fcmToken,
            12
          );
          const notificationModel = new NotificationModel();
          notificationModel.user = mongoose.Types.ObjectId(User._id);
          notificationModel.title = `Your project ${order._id} Starts Soon`;
          notificationModel.body = `Project ${order._id} was supposed to start at Project Scheduled Date project
          start time.`;
          notificationModel.type = "Project Starts Soon";
          notificationModel.deviceToken = User.fcmToken;
          notificationModel.save();
        }
      }
    }
    // Project Still Open
    if (order.requestStatus !== "Accepted" && maxDate < currentDate) {
      for (let index = 0; index < Users.length; index++) {
        const User = Users[index];
        if (
          User.fcmToken !== null &&
          User.fcmToken !== undefined &&
          User.fcmToken !== ""
        ) {
          FCM.push_notification(
            `${order._id} Project is still open.`,
            `Your project with project id ${order._id} is still open. Please take appropriate
            action.`,
            User.fcmToken,
            12
          );
          const notificationModel = new NotificationModel();
          notificationModel.user = mongoose.Types.ObjectId(User._id);
          notificationModel.title = `${order._id} Project is still open.`;
          notificationModel.body = `Your project with project id ${order._id} is still open. Please take appropriate
          action.`;
          notificationModel.type = "Project Still Open";
          notificationModel.deviceToken = User.fcmToken;
          notificationModel.save();
        }
      }
    }
    // New Project Reminder
    if (order.requestStatus !== "Accepted" && minDate > currentDate) {
      for (let index = 0; index < Users.length; index++) {
        const User = Users[index];
        if (
          User.fcmToken !== null &&
          User.fcmToken !== undefined &&
          User.fcmToken !== ""
        ) {
          FCM.push_notification(
            "New Project - REMINDER",
            `REMINDER New projects have been posted.`,
            User.fcmToken,
            12
          );
          const notificationModel = new NotificationModel();
          notificationModel.user = mongoose.Types.ObjectId(User._id);
          notificationModel.title = `New Project - REMINDER`;
          notificationModel.body = `REMINDER New projects have been posted.`;
          notificationModel.type = "New Project Reminder";
          notificationModel.deviceToken = User.fcmToken;
          notificationModel.save();
        }
      }
    }
  }
  for (let index = 0; index < AssignedOrders.length; index++) {
    const AssignedOrder = AssignedOrders[index];
    if (AssignedOrder.orderStatus !== "Completed") {
      FCM.push_notification(
        "Scheduling - REMINDER",
        `REMINDER The project you claimed is in need of scheduling`,
        AssignedOrder.userTo.fcmToken,
        12
      );
      const notificationModel = new NotificationModel();
      notificationModel.user = mongoose.Types.ObjectId(
        AssignedOrder.userTo._id
      );
      notificationModel.title = `Scheduling - REMINDER`;
      notificationModel.body = `REMINDER The project you claimed is in need of scheduling`;
      notificationModel.type = "Scheduling Reminder";
      notificationModel.deviceToken = AssignedOrder.userTo.fcmToken;
      notificationModel.save();
      FCM.push_notification(
        "Scheduling - REMINDER",
        `REMINDER The project you sent is in need of scheduling`,
        AssignedOrder.userBy.fcmToken,
        12
      );
      notificationModel.user = mongoose.Types.ObjectId(
        AssignedOrder.userBy._id
      );
      notificationModel.title = `Scheduling - REMINDER`;
      notificationModel.body = `REMINDER The project you claimed is in need of scheduling`;
      notificationModel.type = "Scheduling Reminder";
      notificationModel.deviceToken = AssignedOrder.userBy.fcmToken;
      notificationModel.save();
    }
  }
});
task.start();
app.use("/", restRouter);

// handler the the UNAUTORIZED
app.use("/failure", (req, res, next) => {
  const error = new Error("Not found");
  error.message = "Invalid Authorization";
  error.status = 401;
  next(error);
});
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.message = "Invalid route";
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  // res.status(error.status || 500);
  return res.status(error.status || 500).json({
    message: error.message,
    status_code: error.status,
  });
});

/**
 * Start Express server.
 */
app.listen(app.get("port"), () => {
  console.log(
    "%s App is running at http://localhost:%d in %s mode",
    chalk.green("✓"),
    app.get("port"),
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});
