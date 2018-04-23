const twitch = window.Twitch.ext;

let config = new Vue({
  el: '#config',
  data: {
    participantId: null
  }
});

let instance;

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
});


function submitForm(participantId) {
  instance.post(`/participant/set/${participantId}`).then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
}