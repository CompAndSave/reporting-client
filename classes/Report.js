const axios = require('axios');

class Report {
  constructor() {}

  static async getCampaignData(bodyRequest, accessToken) {
    
    // Report.reportApiUrl will need to be initialized
    //
    let error, result = await axios({
      url: Report.apiUrl + "campaign-report",
      method: "get",
      data: bodyRequest,
      headers: { "Authorization": `Bearer ${accessToken}` }
    }).catch(err => error = err);

    if (error) { return Promise.reject(error); }
    return Promise.resolve(result.data);
  }
}

module.exports = Report;