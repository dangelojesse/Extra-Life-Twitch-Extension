import $ = require('jquery');
import Handlebars = require('handlebars');
import moment = require('moment');


/*********************************
 * Hi Twitch!
 * I'm using browserify to package
 * up a few things so my source
 * code probably looks a bit crazy.
 * Here is all the good stuff
 **********************************/

  const source = $("#entry-template").html();
  const template = Handlebars.compile(source);
  const participantDataUrl = 'https://www.extra-life.org/index.cfm?fuseaction=donordrive.participant&participantID=';
  const participantDonateLink = $('extra-life__donate');

  let token = '';
  let tuid = '';
  let ebs = '';

  // because who wants to type this every time?
  const twitch = (<any>window).Twitch.ext;

  // create the request options for our Twitch API calls
  let requests = {
    set: createRequest('POST', 'id'),
    get: createRequest('GET', 'query')
  };

  let updateForeverAndEver;

  function createRequest(type, method) {
    return {
      type: type,
      url: 'https://localhost:8080/participant/' + method,
      success: function(participantId) {
        run(participantId);
      },
      error: logError,
      data: {}
    };
  }

  function setAuth(token) {
    Object.keys(requests).forEach(function(req) {
      twitch.rig.log('Setting auth headers');
      requests[req].headers = {
        Authorization: 'Bearer ' + token
      };
    });
  }

  twitch.onContext(function(context: any) {
    twitch.rig.log(context);
  });

  twitch.onAuthorized(function(auth: any) {
    // save our credentials
    token = auth.token;
    tuid = auth.userId;
    setAuth(token);
    $.ajax(requests.get);
  });

function getYear(): number {
  return moment().year();
}

function getData() {
  return fetch(participantDataUrl + 296948 + '&format=json').then(function(response) {
    return response.json();
  });
}

function calcPercent(current: number, goal: number): string {
  return Math.round(current / goal * 100 * 10) / 10 + '%';
}

function run(participantId) {
  if (updateForeverAndEver) {
    clearInterval(updateForeverAndEver);
  }

  getData().then(function(participant: Participant) {
    let viewerData:ViewerData = {
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
}

function logError(_, error, status) {
  twitch.rig.log('EBS request returned ' + status + ' (' + error + ')');
}

$(function() {
  $('#participantForm').submit(function(event) {
    event.preventDefault();

    let value = $(this).find('input').val();

    requests.set.data = {participantId: value};

    $.ajax(requests.set);
  });
});

interface ViewerData {
  participantImage: string;
  year: number;
  goalPercent: string;
  raised: number;
  goal: number;
}

interface Participant {
  avatarImageURL: string;
  createdOn: Date;
  displayName: string;
  fundraisingGoal: number;
  isTeamCaptain: boolean;
  participantID: number;
  teamID: number;
  timestamp: number;
  totalRaisedAmount: number;
}