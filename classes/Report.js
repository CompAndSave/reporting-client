const axios = require('axios');

class Report {
  constructor() {}

  static async getCampaignData(bodyRequest, accessToken) {
    const apiUrl = Report.reportApiUrl + 'campaign-report'
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