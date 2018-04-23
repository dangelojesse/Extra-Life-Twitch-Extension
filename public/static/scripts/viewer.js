const participantDataUrl = 'https://www.extra-life.org/index.cfm?fuseaction=donordrive.participant&participantID=';
const twitch = window.Twitch.ext;

let viewer = new Vue({
  el: '#viewer',
  data: {
    goal: 1,
    total: 1,
    participantImage: './static/images/avatar-constituent-default.gif',
    year: getYear(),
    goalPercent: 50,
    raised: 1,
  }
});

let updateForeverAndEver;

let instance;

let token = '';
let tuid = '';
let ebs = '';

twitch.onContext(function(context) {
  twitch.rig.log(context);
});

twitch.onAuthorized(function(auth) {
  // save our credentials
  token = auth.token;
  tuidt = auth.userId;

  instance = axios.create({
    baseURL: 'https://localhost:8081',
    headers: {'Authorization': 'Bearer ' + token}
  });

  axios.get('/participant/get');
});


////////////////////////
function getYear(){
  const rightMeow =  new Date();

  return rightMeow.getFullYear();
}

function calcPercent(current, goal) {
  return Math.round(current / goal * 100 * 10) / 10 + '%';
}