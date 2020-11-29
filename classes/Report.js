const axios = require('axios');

class Report {
  constructor() {}

  static async getCampaignData(bodyRequest) {
    const apiUrl = process.env.REPORT_API_URL+'campaign-report'
    let conn = axios.get(apiUrl, bodyRequest);
    return Promise.resolve(await conn.then((res)=>res.data).catch((err)=>console.log(err)));
  }
}

module.exports = Report;