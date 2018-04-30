(function() {
  const twitch = window.Twitch.ext;

  $(function() {
    twitch.onAuthorized(function(auth) {
      const token = `Bearer ${auth.token}`;

      getCurrentParticipant(token)
        .done(response => {
          const donationUrl = `https://www.extra-life.org/index.cfm?fuseaction=donate.participant&participantID=${response}`;
          const link = $('[hook=component]');

          link.off('click').on('click', () => {
            window.open(donationUrl, '_blank');
          });
        })
        .fail(error => console.warn(`Error getting current participant ID: ${error}`));
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
