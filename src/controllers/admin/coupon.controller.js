import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
import couponService from "../../services/coupon.service";
import CouponModel from "../../models/coupon.model";
import { makeApiResponce } from '../../libraries/responce';

 export default {
     async listing(req, res) {
         try {
             await  CouponModel.find({}, function(err, coupons) {
                 if (err) {
                     let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
                     return res.status(INTERNAL_SERVER_ERROR).json(result)
                 } else {
                     const url = req.protocol + '://' + req.get('host')
                     let couponRecord = [];
                     coupons.forEach((doc) => {
                         couponRecord.push({
                             id: doc._id,
                             name: doc.name,
                             description: doc.description,
                             service: doc.service,
                             couponCode: doc.code,
                             statusBit: doc.statusBit,
                             image : doc.image
                         });
                     });
                     let couponResponce = couponRecord;
                     let result = makeApiResponce('Coupon Listing', 1, OK, couponResponce);
                     return res.json(result);
                 }
             })

         }catch(err){
             console.log(err);
             let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
             return res.status(INTERNAL_SERVER_ERROR).json(result)
         }
    },
     
//     async listing(req, res){
//         try{
            
//             let getCoupon =  await CouponModel.find({});
//             if(!getCoupon){
//                 let result = makeApiResponce('Empty list coupon', 1, BAD_REQUEST)
//                 return res.status(BAD_REQUEST).json(result);
//             }
            
//             let responce;
//             responce = {
//                     couponData : getCoupon
//                 }
//             let result = makeApiResponce('Coupon Listing', 1, OK, getCoupon);
//             return res.json(result);

//         }catch(err){
//             console.log(err);
//             let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
//             return res.status(INTERNAL_SERVER_ERROR).json(result)
//         }
// },
     
    async add(req, res) {
        try {
                        let image='';
                        if (req.files[0]!== undefined) {
                            image = req.files[0].filename;
                        }
                        // VALIDATE THE REQUEST
                        const {error, value} = couponService.validateAddCouponSchema(req.body);
                        if(error && error.details){
                            let result = makeApiResponce(error.message, 0, BAD_REQUEST)
                            return res.status(BAD_REQUEST).json(result);
                        }
                        const couponModel = new CouponModel();
                        couponModel.user = req.currentUser;
                        couponModel.name = req.body.name;
                        couponModel.description = req.body.description;
                        couponModel.service = req.body.service;
                        couponModel.code = req.body.code;
                        couponModel.statusBit = req.body.statusBit;
                        couponModel.image = image;
                        couponModel.save();
                        let couponResponce = {
                            id: couponModel._id 
                        }
                        let result = makeApiResponce('Coupon Created Successfully', 1, OK, couponResponce);
                        return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async update(req, res) {
         try {

             const findCoupon = await CouponModel.findById(req.params.id);
             if (!findCoupon) {
                 let result = makeApiResponce('Coupon not found.', 1, BAD_REQUEST)
                 return res.status(BAD_REQUEST).json(result);
             }

             let image='';
             if (req.files[0]!== undefined) {
                 image = req.files[0].filename;
             }
                         // VALIDATE THE REQUEST
                         const {error, value} = couponService.validateUpdateCouponSchema(req.body);
                         if(error && error.details){
                             let result = makeApiResponce(error.message, 0, BAD_REQUEST)
                             return res.status(BAD_REQUEST).json(result);
                         }
                         findCoupon.user=req.currentUser;
                         findCoupon.name = req.body.name;
                         findCoupon.description = req.body.description;
                         findCoupon.service = req.body.service;
                         findCoupon.code = req.body.code;
                         findCoupon.statusBit = req.body.statusBit;
                         if (req.files[0]!== undefined) {
                             findCoupon.image = image;
                         }
                         findCoupon.save();
                        let couponResponce = {
                             id: findCoupon._id
                        }
                        
                        let result = makeApiResponce('Coupon updated successfully', 1, OK, couponResponce);
                         return res.json(result);

         }catch(err){
             console.log(err);
             let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
             return res.status(INTERNAL_SERVER_ERROR).json(result)
         }
     },

     
    async detail(req, res) {
         try {

             const findCoupon = await CouponModel.findById(req.params.id);
             if (!findCoupon) {
                 let result = makeApiResponce('Coupon not found.', 1, BAD_REQUEST)
                 return res.status(BAD_REQUEST).json(result);
             }
             const url = req.protocol + '://' + req.get('host');
             let couponResponce = {
                 id: findCoupon._id,
                 name: findCoupon.name,
                 description: findCoupon.description,
                 service: findCoupon.service,
                 couponCode: findCoupon.code,
                 statusBit: findCoupon.statusBit,
                 image : findCoupon.image
             }
             let result = makeApiResponce('Coupon Detail', 1, OK, couponResponce);
             return res.json(result);

         }catch(err){
             console.log(err);
             let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
             return res.status(INTERNAL_SERVER_ERROR).json(result)
         }
     },

     async delete(req, res) {
             try {
                 const findCoupon = await CouponModel.findById(req.params.id);
                 if (!findCoupon) {
                     let result = makeApiResponce('Coupon not found.', 1, BAD_REQUEST)
                     return res.status(BAD_REQUEST).json(result);
                 }

                 const deleteCoupon = await CouponModel.deleteOne({ _id: req.params.id });
                 if (!deleteCoupon) {
                     let result = makeApiResponce('Network Error please try again.', 1, BAD_REQUEST)
                     return res.status(BAD_REQUEST).json(result);
                 }

                 let userResponce = {};
                 let result = makeApiResponce('Coupon Delete Successfully', 1, OK, userResponce);
                 return res.json(result);

             }catch(err){
                 console.log(err);
                 let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
                 return res.status(INTERNAL_SERVER_ERROR).json(result)
             }
     },

};