const axios = require('axios');
const REPORT_API_URL = process.env.NODE_ENV === "production" ? process.env.REPORT_API_URL_PROD : process.env.REPORT_API_URL_STG;

class Report {
  constructor() {}

  static async getCampaignData(bodyRequest, accessToken) {
    const apiUrl = REPORT_API_URL + 'campaign-report'
    let error;
    let result = await axios({
      url: apiUrl,
      method: "get",
      data: bodyRequest,
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }).catch(err => error = err);

    if (error) { return Promise.reject(error); }
    return Promise.resolve(result.data);
  }
}

module.exports = Report;