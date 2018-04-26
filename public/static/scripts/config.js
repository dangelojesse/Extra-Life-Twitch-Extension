const twitch = window.Twitch.ext;

let config = new Vue({
  el: '#config',
  data: {
    participantId: null
  },
  methods: {
    submitForm: function(participantId) {
      console.log(participantId);
      postData(`https://api.extralifetwitchextension.com/participant/set`, {
        participantId: participantId
      }).then(function(data) {console.log(data)})
        .catch(function(error) {console.error(error)});
    }
  }
});

let instance;
let token;

twitch.onContext(function(context) {
  twitch.rig.log(context);
});

twitch.onAuthorized(function(auth) {
  // save our credentials
  token = `Bearer ${auth.token}`;
});

function postData(url, data) {
  return fetch(url, {
    body: JSON.stringify(data),
    headers: {
      'Authorization': token,
    },
    method: 'POST'
  })
  .then(function(response) {response.json()}); // parses response to JSON
}