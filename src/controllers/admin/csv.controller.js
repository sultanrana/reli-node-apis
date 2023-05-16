import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  OK,
} from "http-status-codes";
import { makeApiResponce } from "../../libraries/responce";
import { devConfig } from "../../config/config";
import productModel from "../../models/product.model";
import interiorDoorModel from "../../models/interiorDoor.model";

const fs = require("fs");
const path = require("path");
const fastcsv = require("fast-csv");

export default {
  async uploadCsv(req, res) {
    let csvFile = null;
    if (req.files[0] !== undefined) {
      csvFile = req.files[0].filename;
    }
    if (
      !["window", "interiordoor"].includes(req.body.csvFileType.toLowerCase())
    ) {
      let result = makeApiResponce("invalid service option.", 1, BAD_REQUEST);
      return res.status(BAD_REQUEST).json(result);
    }
    let stream = fs.createReadStream(
      devConfig.docsPath.csvFiles + "/" + csvFile
    );
    let csvData = [];
    if (req.body.csvFileType.toLowerCase() == "window") {
      let csvStream = fastcsv
        .parse()
        .on("data", function (data) {
          csvData.push({
            user: req.currentUser,
            service: req.body.service,
            product_id: data[0],
            job_type: data[1],
            color: data[2],
            grid: data[3],
            open_type: data[4],
            tempered_glass: data[5],
            privacy: data[6],
            safety_glass: data[7],
            dimension_class: data[8],
            price: data[9],
          });
        })
        .on("end", function () {
          // remove the first line: header
          csvData.shift();
          fs.unlinkSync(devConfig.docsPath.csvFiles + "/" + csvFile); // remove temp file

          productModel.insertMany(csvData, (err, res) => {
            if (err) throw err;
            console.log(`Inserted: ${csvData.length} rows in product model`);
          });
        });
      stream.pipe(csvStream);
    } else if (req.body.csvFileType.toLowerCase() == "interiordoor") {
      let csvStream = fastcsv
        .parse()
        .on("data", function (data) {
          console.log(`data=======> ${data}`);
          csvData.push({
            user: req.currentUser,
            service: req.body.service,
            modelName: data[0],
            wallConditionJambWidth: data[1],
            jambWidthInches: data[2],
            doorWidth: data[3],
            doorWidthInches: data[4],
            doorHeight: data[5],
            doorHeightInches: data[6],
            unit: data[7],
            overallFrameWidth: data[8],
            overallFrameHeight: data[9],
            surface: data[10],
            thicknessAndCore: data[11],
            doorThickness: data[12],
            coreType: data[13],
            doorThicknessInches: data[14],
            hinges: data[15],
            isFireRated: data[16].toLowerCase() === "no" ? false : true,
            rsPrice: data[17],
          });
        })
        .on("end", function () {
          // remove the first line: header
          csvData.shift();
          fs.unlinkSync(devConfig.docsPath.csvFiles + "/" + csvFile); // remove temp file

          interiorDoorModel.insertMany(csvData, (err, res) => {
            if (err) throw err;
            console.log(
              `Inserted: ${csvData.length} rows in interior door model`
            );
          });
        });
      stream.pipe(csvStream);
    }

    let userResponce = {};
    let result = makeApiResponce(
      "Products have been successfully imported",
      1,
      OK,
      userResponce
    );
    return res.json(result);
  },

  async getProducts(req, res) {
    try {
      var get_products;
      if (req.params.id == "6373e9f281b3c043a0225ffe") {
        // For windows
        get_products = await productModel.find({ service: req.params.id });
      } else if (req.params.id == "64332da1beedb46ff5a0fcaf") {
        // For interior doors
        get_products = await interiorDoorModel.find({ service: req.params.id });
      }

      if (!get_products) {
        let result = makeApiResponce("Empty list coupon", 1, BAD_REQUEST);
        return res.status(BAD_REQUEST).json(result);
      }
      let result = makeApiResponce("Coupon Listing", 1, OK, get_products);
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

  async exportCsv(req, res) {
    const filename = "export_mongodb_fastcsv" + Date.now() + ".csv";
    const ws = fs.createWriteStream(
      devConfig.docsPath.csvFiles + "/" + filename
    );

    await productModel.find({}, function (err, products) {
      if (err) {
        let result = makeApiResponce(
          "INTERNAL_SERVER_ERROR",
          0,
          INTERNAL_SERVER_ERROR
        );
        return res.status(INTERNAL_SERVER_ERROR).json(result);
      } else {
        const url = req.protocol + "://" + req.get("host");
        let productRecord = [];
        products.forEach((doc) => {
          productRecord.push({
            name: doc.name,
            description: doc.description,
            price: doc.price,
          });
        });

        fastcsv
          .write(productRecord, { headers: true })
          .on("finish", function () {
            let userResponce = {
              file: url + "/src/uploads/docs/csvFiles/" + filename,
            };
            let result = makeApiResponce("Successfully", 1, OK, userResponce);
            return res.json(result);
          })
          .pipe(ws);
      }
    });
  },

  async update(req, res) {
    try {
      const productData = await productModel.findById(req.params.id);
      if (!productData) {
        let result = makeApiResponce("Not found.", 1, BAD_REQUEST);
        return res.status(BAD_REQUEST).json(result);
      }
      console.log(req.body.price);
      productData.price = req.body.price;

      productData.save();
      let responce = {
        id: productData._id,
      };

      let result = makeApiResponce("Successfully", 1, OK, responce);
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
