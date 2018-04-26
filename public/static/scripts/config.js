const twitch = window.Twitch.ext;

let config = new Vue({
  el: '#config',
  data: {
    participantId: null
  }
});

let instance;
let token;

twitch.onContext(function(context) {
  twitch.rig.log(context);
});

twitch.onAuthorized(function(auth) {
  // save our credentials
  token = `Bearer${auth.token}`;
});

function submitForm(participantId) {
  postData(`https://api.extralifetwitchextension.com/participant/set?participantId=${participantId}`)
    .then(data => console.log(data))
    .catch(error => console.error(error));
}

function postData(url) {
  return fetch(url, {
    headers: {
      'Authorization':token,
    },
    method: 'POST',
    mode: 'no-cors',
  })
  .then(response => response.json()) // parses response to JSON
}