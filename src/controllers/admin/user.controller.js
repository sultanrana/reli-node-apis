import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
import bcryptjs from 'bcryptjs';
import userService from "../../services/user.service";
import UserModel from "../../models/user.model";
import { devConfig } from '../../config/config.js';
import { getJWTToken, getEncryptedPassword } from '../../libraries/util';
import { makeApiResponce } from '../../libraries/responce';
import request from "request";
import { Console } from "console";
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
export default {
async signup(req, res){
        try{
            // VALIDATE THE REQUEST
            const {error, value} = userService.validateSignupSchema(req.body);
            if(error && error.details){
                let result = makeApiResponce(error.message, 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            const existingUser = await UserModel.findOne({ email: req.body.email });
            if (existingUser) {
                let result = makeApiResponce('Email is Already Exsit', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const user = new UserModel();
            if (req.files) {
                for (var i = 0; i < req.files.length; i++) {
                  if (req.files[i].fieldname == "profileImage") {
                    user.profileImage =
                      `${devConfig.getImagesPath.userImage}/` + req.files[i].filename;
                  }
                  if (req.files[i].fieldname == "profilePic") {
                    user.profilePic =
                      `${devConfig.getImagesPath.userImage}/` + req.files[i].filename;
                  }
                }
              }
            user.email = req.body.email;
            user.name = req.body.name;
            user.gender = req.body.gender;
            user.country = req.body.country;
            user.city = req.body.city;
            user.state = req.body.state;
            user.skills = req.body.skills;
            user.dateOfbirth = req.body.dateOfbirth;
            const hash = await getEncryptedPassword(req.body.password);
            user.password = hash;
            await user.save();
            let userResponce = {
                name: user.name,
                email: user.email,
            }
            let result = makeApiResponce('User Created Successfully', 1, OK, userResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
},
async login(req, res){
        try{
            // VALIDATE THE REQUEST
            const {error, value} = userService.validateLoginSchema(req.body);
            if(error && error.details){
                let result = makeApiResponce(error.message, 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            // FETCH THE USER
            const userQuery = { email: req.body.email };
            let user =  await UserModel.findOne(userQuery);
            if(!user){
                let result = makeApiResponce('Invalid Email and Passowrd', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const matched = await bcryptjs.compare(req.body.password, user.password)
            if(!matched){
                let result = makeApiResponce('invalid Credential', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const token = await getJWTToken({id: user._id});
            let userResponce;
                 userResponce = {
                    user_id : user._id,
                    name: user.name,
                    email: user.email,
                    profileImage: user.profileImage,
                    profilePic: user.profilePic,
                    skills: user.skills,
                    country: user.country,
                    state: user.state,
                    city: user.city,
                    token: token
                }
            let result = makeApiResponce('LoggedIn Successfully', 1, OK, userResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
}, 
async test(req, res){
        return res.json(req.currentUser);
},
async logout(req, res){
        // req.logOut(); // remove the session and remove req.currentUser;
         req.logout();
         req.session.destroy();
        return res.json({ success: true });
        // Get rid of the session token. Then call `logout`; it does no harm.
        // req.logout();
        // req.session.destroy(function (err) {
        //     if (err) { return next(err); }
        //     // The response should indicate that the user is no longer authenticated.
        //     return res.send({ authenticated: req.isAuthenticated() });
        // });
},
async getData(req, res){
        var url = "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/countries.json"
        request({
            url: url,
            json: true
        }, 
        function (error, response, body) {
    if (!error && response.statusCode === 200) {
        console.log(body) // Print the json response
    }
})
},
async clearGmail(req, res){
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content), listLabels);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
}
},

  async testFunction(req, res) {
    let totalField = req.body.totalField;
    let fieldObj = req.body.fieldObj;
    let fieldName = req.body.fieldName;
    let fieldValue = req.body.fieldValue;
    let fieldAction = req.body.fieldAction;
   
    if (fieldAction === 'delete') {
      if (fieldObj.hasOwnProperty(fieldName)) {
        var prop = fieldName;
        delete fieldObj[prop];
        let result = makeApiResponce('Delete the field value Successfully', 1, OK, fieldObj);
        return res.json(result);
      } else {
        let result = makeApiResponce('invalid field name', 1, BAD_REQUEST)
        return res.status(BAD_REQUEST).json(result);
      }
    } else if (fieldAction === 'edit') {
      if (fieldObj.hasOwnProperty(fieldName)) {
        var propEdit = fieldName;
        fieldObj[propEdit] = fieldValue;
        let result = makeApiResponce('Edit field value Successfully', 1, OK, fieldObj);
        return res.json(result);
      } else {
        let result = makeApiResponce('invalid field name', 1, BAD_REQUEST)
        return res.status(BAD_REQUEST).json(result);
      }
        
    } else {
      let result = makeApiResponce('invalid action', 1, BAD_REQUEST)
      return res.status(BAD_REQUEST).json(result);
    }

  },

};