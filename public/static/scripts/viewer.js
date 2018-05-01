(function() {
  const participantIdUrl = 'https://api.extralifetwitchextension.com/participant/get';
  const twitch = window.Twitch.ext;
  let updateForeverAndEver;
  let initialLoop = true;
  let participant;

  $(function() {
    loading(true);
    twitch.onAuthorized(function(auth) {
      const token = `Bearer ${auth.token}`;
      start(token);
    });
  });

  function start(token) {
    getCurrentParticipant(token)
      .done(response => {
        getExtraLifeParticipant(response)
          .done(response => {
            fetchedParticipant(response);
          });
      });
  }

  function fetchedParticipant(fetchedParticipant) {
    participant = fetchedParticipant;
    setUI();
    repeatUI()

    if(initialLoop) {
      loading(false);
      initialLoop = false;
    }
  }

  function setUI() {
    const donationUrl = `https://www.extra-life.org/index.cfm?fuseaction=donate.participant&participantID=${participant.participantID}`;
    const calculatedPercent = calcPercent(participant.sumDonations, participant.fundraisingGoal);
    const link = $('[hook=link]');

    link.off('click').on('click', () => {
      window.open(donationUrl, '_blank');
    });

    setText('totalRaisedAmount', participant.sumDonations);
    setText('fundraisingGoal', participant.fundraisingGoal);
    setText('year', getCurrentYear());
    setText('goalPercent', calculatedPercent);
    setAttribute('goalPercent', 'style', `width: ${calculatedPercent}`);
    setAttribute('avatarImageURL', 'src', `https:${participant.avatarImageURL}`);
  }

  /**
   * @desc
   * Simple function that repeats the API call to retrieve
   * the Extra Life data and performs a series of actions
   * via the fetchedParticipant() function.
   */
  function repeatUI() {
    if (updateForeverAndEver) {
      clearInterval(updateForeverAndEver);
    }

    updateForeverAndEver = setInterval(() => {
      getExtraLifeParticipant(participant.participantID)
        .done(response => {
          fetchedParticipant(response);
        });
    }, 20000);
  }

  /**
   * @desc
   * Displays the loading animation until specifed.
   *
   * @example
   * loading(true);
   *
   * @param status {boolean}
   */
  function loading(status) {
    if(status) {
      $('.extra-life').hide();
      $('.extra-life--loading').show();
      return;
    }
    $('.extra-life').show();
    $('.extra-life--loading').hide();
    return;
  }

  /**
   * @desc
   * Simple function to set the value of an attribute
   * that use the custom hook attribute.
   *
   * @param {string} hook The name of the hook attribute in template
   * @param {string} attr The attribute you wish to modify
   * @param {string} setting desired value of attribute.
   *
   * @example
   * setAttribute('test', 'style', 'color:red');
   *
   * @return Void
   */
  function setAttribute(hook, attr, setting) {
    $(`[hook=${hook}]`).attr(attr, setting);
  }

  /**
   * @desc
   * Simple function to set the text of attributes
   * that use the custom hook attribute.
   *
   * @param {string} hook The name of the hook attribute in template
   * @param {string} content desired text to be inserted in the html
   *
   * @example
   * setText('test', 'Cool Text');
   *
   * @return Void
   */
  function setText(hook, content) {
    $(`[hook=${hook}]`).text(content);
  }

  /**
   * @desc
   * Returns the Current Year
   *
   * @return {string}
   */
  function getCurrentYear() {
    const rightMeow = new Date().getFullYear();

    return rightMeow.toString();
  }

  /**
   * @desc
   * Uses the fundraising total and fundraising goal to calculate the
   * current progress towards the participants fundraising
   *
   * @param {number} total Current Fundraising Total.
   * @param {number} goal Fundraising Goal.
   *
   * @example
   * calcPercent(10, 100);
   *
   * @return {string} Progress towards the current Extra Life Goal
   */
  function calcPercent(total, goal) {
    return Math.round(total / goal * 100 * 10) / 10 + '%';
  }

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

  function getExtraLifeParticipant(participantId) {
    const extraLifeParticipantUrl = `https://www.extra-life.org/api/participants/${participantId}`;
    return $.ajax({
      url: extraLifeParticipantUrl
    });
  }
})();
