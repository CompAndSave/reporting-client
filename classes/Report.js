const axios = require('axios');

class Report {
  constructor() {}

  static async getCampaignData(bodyRequest) {
    const apiUrl = process.env.REPORT_API_URL+'campaign-report'
    let error;
    let result = await axios.get(apiUrl, { data: bodyRequest }).catch(err => error = err);

    if (error) { return Promise.reject(error); }
    return Promise.resolve(result.data);
  }
}

module.exports = Report;