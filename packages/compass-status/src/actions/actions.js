import Reflux from 'reflux';

const StatusActions = Reflux.createActions([
  /**
   * shows the progress bar.
   */
  'showProgressBar',
  /**
   * shows an indeterminate progress bar at 100 percent.
   */
  'showIndeterminateProgressBar',
  /**
   * enable trickle: progress bar randomly advances a few percentage points
   * every second to indicate progress.
   */
  'enableProgressTrickle',
  /**
   * disable trickle.
   */
  'disableProgressTrickle',
  /**
   * sets a message that is shown on the screen above the loading animation.
   *
   * @param {String} message    the message to show
   */
  'setMessage',
  /**
   * clears and removes the message.
   */
  'clearMessage',
  /**
   * set a custom subview that is shown below the loading animation. For example,
   * the schema view sets a subview to indicate longer than usual parsing.
   *
   * @param {View} subview    the subview to render.
   */
  'setSubview',
  'setSubviewStore',
  'setSubviewActions',
  /**
   * clears the custom subview.
   */
  'clearSubview',
  /**
   * when enabled, overlays the screen with a transparent div, so that no other
   * interaction can take place.
   */
  'enableModal',
  /**
   * TODO: This modal flag does not currently work, it needs to change the style
   * into say a popup box so it's clear what the user can/cannot click on.
   * disables the modal transparent div.
   */
  'disableModal',
  /**
   * custom configuration to set all the options above in a single call.
   *
   * @param {Object}  options          options to configure, see below:
   *
   * @param {Boolean} options.visible       show/hide entire status view
   * @param {Boolean} options.progressbar   show/hide progress bar
   * @param {Number}  options.width         progress bar width 0-100
   * @param {Boolean} options.modal         activate/deactivate modal
   * @param {Boolean} options.animation     show/hide animation
   * @param {String}  options.message       message to show, '' disables message
   * @param {View}    options.subview       subview to show, or `null`
   */
  'configure',
  /**
   * hide all status components (progress bar, message, animation).
   * Use when loading was interrupted.
   */
  'hide',
  /**
   * like `hide()` but animates the progress bar to 100% before hiding, so that
   * the user gets feedback of success. Use when loading is complete.
   */
  'done',
  'setGlobalAppRegistry'
]);

export default StatusActions;
export { StatusActions };
