import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
import { makeApiResponce } from '../../libraries/responce';
import productModel from "../../models/product.model";
const fs = require('fs');
const path = require('path');
const fastcsv = require("fast-csv");
import { devConfig } from '../../config/config'

export default {
  async uploadCsv(req, res){
                      let csvFile=null;
                      if (req.files[0]!== undefined) {
                          csvFile = req.files[0].filename;
                      }
                      let stream = fs.createReadStream(devConfig.docsPath.csvFiles+"/"+csvFile);
                      let csvData = [];
                      let csvStream = fastcsv
                          .parse()
                          .on("data", function(data) {
                              csvData.push({
                                  "user":req.currentUser,
                                  name: data[0],
                                  description: data[1],
                                  price: data[2]
                              });
                          })
                          .on("end", function() {
                              // remove the first line: header
                              csvData.shift();
                              fs.unlinkSync(devConfig.docsPath.csvFiles+'/'+csvFile);   // remove temp file

                                productModel.insertMany(csvData, (err, res) => {
                                    if (err) throw err;
                                    console.log(`Inserted: ${csvData.length} rows`);
                                });
                          });
                      stream.pipe(csvStream);
                      let userResponce = {};
                      let result = makeApiResponce('Products have been successfully imported', 1, OK, userResponce);
                      return res.json(result);
    },

  async exportCsv(req, res){
     const filename = "export_mongodb_fastcsv"+Date.now()+".csv";
      const ws = fs.createWriteStream(devConfig.docsPath.csvFiles+'/'+filename);

      await   productModel.find({}, function(err, products) {
          if (err) {
              let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
              return res.status(INTERNAL_SERVER_ERROR).json(result)
          } else {
            const url = req.protocol + '://' + req.get('host')
            let productRecord = [];
              products.forEach((doc) => {
                  productRecord.push({
                      name: doc.name,
                      description: doc.description,
                      price: doc.price
                  });
              });

              fastcsv
                  .write(productRecord, { headers: true })
                  .on("finish", function () {
                      let userResponce = {
                          file: url + "/src/uploads/docs/csvFiles/"+filename
                    };
                    let result = makeApiResponce('Successfully', 1, OK, userResponce);
                      return res.json(result);
                      
                    //   var fileLocation = path.join(devConfig.docsPath.csvFiles,filename)
                    //   res.download(fileLocation, filename);
                    //   console.log("Write to bezkoder_mongodb_fastcsv.csv successfully!");
                  })
                  .pipe(ws);
          }
      })
  },

};
