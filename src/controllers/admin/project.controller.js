import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  OK,
  NOT_FOUND,
} from "http-status-codes";
import bcryptjs from "bcryptjs";
import userService from "../../services/user.service.js";
import UserModel from "../../models/user.model";
import {
  getJWTToken,
  randomValueHex,
  getEncryptedPassword,
} from "../../libraries/util";
import { makeApiResponce } from "../../libraries/responce";
import { sendEmail } from "../../libraries/mail";
import ServiceModel from "../../models/service.model";
import PropertyModel from "../../models/property.model";
import OrderModel from "../../models/order.model";
import OrderDetailModel from "../../models/orderDetail.model";
import CompanyModel from "../../models/company.model";
import OrderAcceptedModel from "../../models/orderAccepted.model";
import StaffModel from "../../models/staff.model";
import mongoose from "mongoose";
import NotificationModel from "../../models/notification.model";
import AssignedOrderModel from "../../models/assignedOrder.model";
import customAlphabet from "nanoid"

export default {
  /////////// project /////////////////
  async listing(req, res) {
    try {
      const getOrders = await OrderModel.aggregate([
        {
          $lookup: {
            from: "orderdetails",
            localField: "_id",
            foreignField: "order",
            as: "orderdetails",
            pipeline: [
              {
                $lookup: {
                  from: "properties",
                  localField: "property",
                  foreignField: "_id",
                  as: "property",
                },
              },
              // { $unwind: "$property" }, mondatroy
              {
                $unwind: {
                  path: "$property",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "services",
                  localField: "service",
                  foreignField: "_id",
                  as: "service",
                },
              },
              {
                $unwind: { path: "$service", preserveNullAndEmptyArrays: true },
              },
            ],
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);

      if (!getOrders) {
        let result = makeApiResponce("Empty list of projects", 1, BAD_REQUEST);
        return res.status(BAD_REQUEST).json(result);
      }

      let result = makeApiResponce("List of projects", 1, OK, getOrders);
      return res.json(result);
    } catch (err) {
      console.log(err);
      let result = makeApiResponce(
        "INTERNAL_SERVER_ERROR",
        0,
        INTERNAL_SERVER_ERROR
      );
      return res.status(INTERNAL_SERVER_ERROR).json(result);
    }
  },
  async assignProjectToUser(req, res) {
    try {
      if (
        mongoose.isValidObjectId(req.body.userTo) &&
        mongoose.isValidObjectId(req.body.order)
      ) {
        // const isProjectAlreadyAssigned = await AssignedOrderModel.findOne({order:req.body.order, delBit: false})
        const isProjectAlreadyAssigned = await AssignedOrderModel.findOne({
          userTo: req.body.userTo,
          delBit: false,
        });
        if (!isProjectAlreadyAssigned) {
          const nanoid = customAlphabet('1234567890ABCD', 10)

          const assignedOrderModel = new AssignedOrderModel();
          assignedOrderModel.order = req.body.order;
          assignedOrderModel.userBy = req.currentUser._id;
          assignedOrderModel.userTo = req.body.userTo;
          assignedOrderModel.assignedDate = req.body.assignedDate;
          assignedOrderModel.projectId = `PROJ ${nanoid(5)}`
          assignedOrderModel.save();
          let assignedOrderResponce = {
            id: assignedOrderModel._id,
          };
          let result = makeApiResponce(
            "Assigned project to user created successfully",
            1,
            OK,
            assignedOrderResponce
          );
          return res.json(result);
        } else {
          let result = makeApiResponce(
            "Project is already assigned to user",
            0,
            NOT_FOUND
          );
          return res.status(NOT_FOUND).json(result);
        }
      } else {
        let result = makeApiResponce("Invalid UserTo/Order", 0, NOT_FOUND);
        return res.status(NOT_FOUND).json(result);
      }
    } catch (err) {
      console.log(err);
      let result = makeApiResponce(
        "INTERNAL_SERVER_ERROR",
        0,
        INTERNAL_SERVER_ERROR
      );
      return res.status(INTERNAL_SERVER_ERROR).json(result);
    }
  },
  async detail(req, res) {
    try {
      const orderModel = await OrderModel.findById(req.params.id);
      // const orderDetailInfo =  await OrderDetailModel.find({order : req.params.id}).populate('property').populate('service');

      let orderDetail = await OrderModel.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(req.params.id) },
        },
        {
          $lookup: {
            from: "orderdetails",
            localField: "_id",
            foreignField: "order",
            as: "orderdetails",
            pipeline: [
              {
                $lookup: {
                  from: "properties",
                  localField: "property",
                  foreignField: "_id",
                  as: "property",
                },
              },
              // { $unwind: "$property" }, mondatroy
              {
                $unwind: {
                  path: "$property",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "services",
                  localField: "service",
                  foreignField: "_id",
                  as: "service",
                },
              },
              {
                $unwind: { path: "$service", preserveNullAndEmptyArrays: true },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "orderaccepteds",
            localField: "_id",
            foreignField: "order",
            as: "orderaccepteds",
          },
        },
        {
          $unwind: {
            path: "$orderaccepteds",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "assignedorders",
            localField: "_id",
            foreignField: "order",
            pipeline: [
              {
                $lookup: {
                  from: "users",
                  localField: "userBy",
                  foreignField: "_id",
                  as: "userBy",
                },
              },
              // { $unwind: "$property" }, mondatroy
              {
                $unwind: { path: "$userBy", preserveNullAndEmptyArrays: true },
              },
              {
                $lookup: {
                  from: "users",
                  localField: "userTo",
                  foreignField: "_id",
                  as: "userTo",
                },
              },
              {
                $unwind: { path: "$userTo", preserveNullAndEmptyArrays: true },
              },

              // {
              //     $unwind: "$property" if mandatory
              // }
            ],
            as: "assignedorder",
          },
        },
        {
          $unwind: { path: "$assignedorder", preserveNullAndEmptyArrays: true },
        },
        // {
        //     $unwind: '$orderaccepteds'
        // },
        {
          $sort: { createdAt: -1 },
        },
      ]);


      if (!orderDetail) {
        let result = makeApiResponce("Empty Order Detail", 1, BAD_REQUEST);
        return res.status(BAD_REQUEST).json(result);
      }
      let result = makeApiResponce("Order Detail", 1, OK, orderDetail);
      return res.json(result);
    } catch (err) {
      console.log(err);
      let result = makeApiResponce(
        "INTERNAL_SERVER_ERROR",
        0,
        INTERNAL_SERVER_ERROR
      );
      return res.status(INTERNAL_SERVER_ERROR).json(result);
    }
  },
  async projectDetail(req, res) {
    try {
      const order_info = await OrderModel.findById(req.params.id)
        .populate("user")
        .populate("orderAccepted");
      const order_id = order_info._id;
      let order_detail = await OrderDetailModel.find({ order: order_id })
        .populate("property")
        .populate("service");
      let assigned_order = await AssignedOrderModel.find({ order: order_id })
        .populate("userBy")
        .populate("userTo");
      let finalArray = {
        order_info: order_info,
        order_detail: order_detail,
        assigned_order: assigned_order,
      };

      if (!order_info) {
        let result = makeApiResponce(
          "Project is already assigned to user",
          0,
          NOT_FOUND
        );
        return res.status(NOT_FOUND).json(result);
      } else {
        let result = makeApiResponce("Successfully", 1, OK, finalArray);
        return res.json(result);
      }
    } catch (err) {
      console.log(err);
      let result = makeApiResponce(
        "INTERNAL_SERVER_ERROR",
        0,
        INTERNAL_SERVER_ERROR
      );
      return res.status(INTERNAL_SERVER_ERROR).json(result);
    }
  },

  async changeProjectStatus(req, res) {
    try {
      const findOrder = await OrderModel.findById(req.params.id);
      if (!findOrder) {
        let result = makeApiResponce("Project not found.", 1, BAD_REQUEST);
        return res.status(BAD_REQUEST).json(result);
      }

      if (req.body.orderStatus.toLowerCase() === "paid") {
        if (findOrder.orderStatus.toLowerCase() == "completed") {
          findOrder.orderStatus = req.body.orderStatus;
        } else {
          let result = makeApiResponce(
            "Project is not completed.",
            1,
            BAD_REQUEST
          );
          return res.status(BAD_REQUEST).json(result);
        }
      }

      findOrder.orderStatus = req.body.orderStatus;
      findOrder.orderStatusDate = Date.now();
      await findOrder.save();

      let orderResponce = {
        id: findOrder._id,
      };

      let result = makeApiResponce(
        "Project status updated successfully",
        1,
        OK,
        orderResponce
      );
      return res.json(result);
    } catch (err) {
      console.log(err);
      let result = makeApiResponce(
        "INTERNAL_SERVER_ERROR",
        0,
        INTERNAL_SERVER_ERROR
      );
      return res.status(INTERNAL_SERVER_ERROR).json(result);
    }
  },
};
