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
  token = `Bearer ${auth.token}`;

  fetch('https://api.extralifetwitchextension.com/participant/get', {
    headers: {
      'Authorization': token
    }
  }).then(response => {
      console.log(response);
      return run(response);
  }).catch(function(error) {
      console.error('Error:', error)
  })
    .then(function(response) {
      console.log('Success:', response)
  });
});

//
function getYear(){
  const rightMeow =  new Date();

  return rightMeow.getFullYear();
}

function calcPercent(current, goal) {
  return Math.round(current / goal * 100 * 10) / 10 + '%';
}

function run(participantId) {
  if (updateForeverAndEver) {
    clearInterval(updateForeverAndEver);
  }

    getData(participantId).then(function(participant) {
    let viewerData = {
      year: getYear(),
      participantImage: participant.avatarImageURL,
      raised: participant.totalRaisedAmount,
      goal: participant.fundraisingGoal,
      goalPercent: calcPercent(participant.totalRaisedAmount, participant.fundraisingGoal)
    }

    participantDonateLink.on('click', function() {
      window.open(participantDataUrl + participant.participantID, '_blank');
    });

    participantDonateLink.off('click');
    $('body').html(template(viewerData));
  });
  updateForeverAndEver = setInterval(function() {
    run(participantId);
  }, 60000);
};

function getData(participantId) {
  return fetch(`${participantDataUrl}${participantId}&format=json`).then(function(response) {
    return response.json();
  });
}
