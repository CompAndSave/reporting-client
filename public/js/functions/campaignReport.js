import('../lib/ajaxCall.js');

function getCampaignReport(data) {
  let result = new Promise((resolve, reject) => ajaxCall("GET", 'http://localhost:3000/campaign-report', data));
  result.then(() => {
    alert("Action Success!");
    location.reload();
  }).catch(err => {
    console.log(err)
  });
}