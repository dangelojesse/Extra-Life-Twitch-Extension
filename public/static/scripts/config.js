(function() {
  const setParticipantUrl = 'https://api.extralifetwitchextension.com/participant/set';
  const twitch = window.Twitch.ext;

  $(function() {
    var participantId = $('[hook=input');

    twitch.onAuthorized(function(auth) {
      const token = `Bearer ${auth.token}`;

      getCurrentParticipant(token)
        .done(response => {
          participantId.val(response);
        })
        .fail(error => console.warn(`Error getting current participant ID: ${error}`));

      $('[hook=form]').submit((event) => {
        event.preventDefault();

        postData(setParticipantUrl, {
          participantId: participantId.val()
        })
          .done(() => {
            fade('success');
          })
          .fail(() => {
            fade('error');
          })
      });

      function fade(hook) {
        $(`[hook=${hook}]`).fadeIn().delay(15000).fadeOut();
      }

      function postData(url, data) {
        return $.ajax(url, {
          data: data,
          headers: {
            'Authorization': token,
          },
          method: 'POST'
        });
      }
    });
  });

  /**
   * @description
   * Makes an API call to the backend server to retrieve
   * the participant ID.
   *
   * @param {string} token provided upon twitch.onAuthorized
   */
  function getCurrentParticipant(token) {
    return $.ajax({
      url: `https://api.extralifetwitchextension.com/participant/get`,
      headers: {
        'Authorization': token
      }
    });
  }
})();
