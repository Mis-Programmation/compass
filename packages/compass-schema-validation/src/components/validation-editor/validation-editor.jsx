import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import 'ace-builds';
import AceEditor from 'react-ace';
import { debounce } from 'lodash';
import { ValidationAutoCompleter } from 'mongodb-ace-autocompleter';
import { TextButton } from 'hadron-react-buttons';
import { InfoSprinkle } from 'hadron-react-components';
import { createLoggerAndTelemetry } from '@mongodb-js/compass-logging';
import { checkValidator } from '../../modules/validation';
import ValidationSelector from '../validation-selector';

import styles from './validation-editor.module.less';

import tools from 'ace-builds/src-noconflict/ext-language_tools';
import 'mongodb-ace-mode';
import 'mongodb-ace-theme';

const { track } = createLoggerAndTelemetry('COMPASS-SCHEMA-VALIDATION-UI');

/**
 * Options for the ACE editor.
 */
const OPTIONS = {
  enableLiveAutocompletion: true,
  tabSize: 2,
  fontSize: 11,
  minLines: 17,
  maxLines: Infinity,
  highlightActiveLine: false,
  showGutter: true,
  useWorker: false,
  showPrintMargin: false
};

/**
 * Validation actions options.
 */
const ACTION_OPTIONS = { warn: 'Warning', error: 'Error' };

/**
 * Validation level options.
 */
const LEVEL_OPTIONS = { off: 'Off', moderate: 'Moderate', strict: 'Strict' };

/**
 * URL to validation action documentation.
 */
const ACTION_HELP_URL = 'https://docs.mongodb.com/manual/reference/command/collMod/#validationAction';

/**
 * URL to validation level documentation.
 */
const LEVEL_HELP_URL = 'https://docs.mongodb.com/manual/reference/command/collMod/#validationLevel';

/**
 * The validation editor component.
 */
class ValidationEditor extends Component {
  static displayName = 'ValidationEditor';

  static propTypes = {
    fetchSampleDocuments: PropTypes.func.isRequired,
    validatorChanged: PropTypes.func.isRequired,
    validationActionChanged: PropTypes.func.isRequired,
    validationLevelChanged: PropTypes.func.isRequired,
    cancelValidation: PropTypes.func.isRequired,
    saveValidation: PropTypes.func.isRequired,
    serverVersion: PropTypes.string,
    fields: PropTypes.array,
    validation: PropTypes.shape({
      validator: PropTypes.string.isRequired,
      validationAction: PropTypes.string.isRequired,
      validationLevel: PropTypes.string.isRequired,
      isChanged: PropTypes.bool.isRequired,
      syntaxError: PropTypes.object,
      error: PropTypes.object
    }),
    openLink: PropTypes.func.isRequired,
    isEditable: PropTypes.bool.isRequired
  };

  /**
   * Set up the autocompleters once on initialization.
   *
   * @param {Object} props - The properties.
   */
  constructor(props) {
    super(props);
    const textCompleter = tools.textCompleter;

    this.completer = new ValidationAutoCompleter(
      props.serverVersion,
      textCompleter,
      props.fields
    );
    this.debounceValidatorChanged = debounce((validator, hasErrors) => {
      this.props.fetchSampleDocuments(validator, hasErrors);
      this.trackValidator(validator);
    }, 750);
  }

  /**
   * Should the component update?
   *
   * @param {Object} nextProps - The next properties.
   *
   * @returns {Boolean} If the component should update.
   */
  shouldComponentUpdate(nextProps) {
    return (
      nextProps.validation.validator !== this.props.validation.validator ||
      nextProps.validation.validationAction !== this.props.validation.validationAction ||
      nextProps.validation.validationLevel !== this.props.validation.validationLevel ||
      nextProps.validation.error !== this.props.validation.error ||
      nextProps.validation.syntaxError !== this.props.validation.syntaxError ||
      nextProps.validation.isChanged !== this.props.validation.isChanged ||
      nextProps.serverVersion !== this.props.serverVersion ||
      nextProps.fields.length !== this.props.fields.length
    );
  }

  /**
   * If there are new fields update autocompleter with new fields.
   */
  componentDidUpdate() {
    this.completer.update(this.props.fields);
    this.completer.version = this.props.serverVersion;
  }

  /**
   * Save validator changes.
   */
  onValidatorSave() {
    this.props.saveValidation(this.props.validation);
  }

  /**
   * Save validator changes.
   *
   * @param {Object} validator - The validator.
   */
  onValidatorChange(validator) {
    this.props.validatorChanged(validator);
    this.validatorChanged();
  }

  /**
   * Checks if there is any error.
   *
   * @returns {Boolean} True if there is an error.
   */
  hasErrors() {
    return (this.props.validation.error || this.props.validation.syntaxError);
  }

  /**
   * Validator changed.
   */
  validatorChanged() {
    this.debounceValidatorChanged(
      this.props.validation.validator,
      this.hasErrors()
    );
  }

  trackValidator(validator) {
    const checkedValidator = checkValidator(validator);
    const trackEvent = {
      json_schema: Boolean(checkedValidator.validator.$jsonSchema),
    };
    track('Schema Validation Edited', trackEvent);
  }

  /**
   * Render action selector.
   *
   * @returns {React.Component} The component.
   */
  renderActionSelector() {
    const label = [
      <span key="validation-action-label">Validation Action</span>,
      <InfoSprinkle
        key="validation-action-sprinkle"
        helpLink={ACTION_HELP_URL}
        onClickHandler={this.props.openLink}
      />
    ];

    return (
      <div className={classnames(styles['validation-option'])}>
        <ValidationSelector
          id="validation-action-selector"
          bsSize="xs"
          options={ACTION_OPTIONS}
          title={ACTION_OPTIONS[this.props.validation.validationAction]}
          label={label}
          disabled={!this.props.isEditable}
          onSelect={this.props.validationActionChanged} />
      </div>
    );
  }

  /**
   * Render level selector.
   *
   * @returns {React.Component} The component.
   */
  renderLevelSelector() {
    const label = [
      <span key="validation-level-span">Validation Level</span>,
      <InfoSprinkle
        key="validation-level-sprinkle"
        helpLink={LEVEL_HELP_URL}
        onClickHandler={this.props.openLink}
      />
    ];

    return (
      <div className={classnames(styles['validation-option'])}>
        <ValidationSelector
          id="validation-level-selector"
          bsSize="xs"
          options={LEVEL_OPTIONS}
          title={LEVEL_OPTIONS[this.props.validation.validationLevel]}
          label={label}
          disabled={!this.props.isEditable}
          onSelect={this.props.validationLevelChanged} />
      </div>
    );
  }

  /**
   * Render validation message.
   *
   * @returns {React.Component} The component.
   */
  renderValidationMessage() {
    if (this.hasErrors()) {
      let message = '';
      let colorStyle = '';

      if (this.props.validation.syntaxError) {
        message = this.props.validation.syntaxError.message;
        colorStyle = styles['validation-message-container-syntax-error'];
      } else if (this.props.validation.error) {
        colorStyle = styles['validation-message-container-error'];
        message = this.props.validation.error.message;
      }

      return (
        <div className={classnames({
          [styles['validation-message-container']]: true,
          [colorStyle]: true
        })}>
          <div className={styles['validation-message']}>
            {message}
          </div>
        </div>
      );
    }
  }

  /**
   * Render actions pannel.
   *
   * @returns {React.Component} The component.
   */
  renderActionsPanel() {
    if (this.props.validation.isChanged) {
      return (
        <div className={classnames(styles['validation-action-container'])}>
          <div className={classnames(styles['validation-action-message'])} data-test-id="validation-action-message">
            Validation modified
          </div>
          <TextButton
            dataTestId="cancel-validation-button"
            className={`btn btn-default btn-xs ${classnames(styles.cancel)}`}
            text="Cancel"
            clickHandler={this.props.cancelValidation} />
          <TextButton
            dataTestId="update-validation-button"
            className={`btn btn-primary btn-xs ${this.hasErrors() ? 'disabled' : ''}`}
            text="Update"
            clickHandler={this.onValidatorSave.bind(this)} />
        </div>
      );
    }
  }

  /**
   * Render ValidationEditor component.
   *
   * @returns {React.Component} The rendered component.
   */
  render() {
    return (
      <div className={classnames(styles['validation-editor'])} data-test-id="validation-editor">
        <div className={classnames(styles['validation-editor-content'])}>
          <div className={classnames(styles['validation-options-container'])}>
            {this.renderActionSelector()}
            {this.renderLevelSelector()}
          </div>
          <hr />
          <div className={classnames(styles['brace-editor-container'])}>
            <AceEditor
              mode="mongodb"
              theme="mongodb"
              width="100%"
              height="100%"
              value={this.props.validation.validator}
              onChange={this.onValidatorChange.bind(this)}
              editorProps={{$blockScrolling: Infinity}}
              setOptions={OPTIONS}
              readOnly={!this.props.isEditable}
              onFocus={() => tools.setCompleters([this.completer])} />
          </div>
          {this.renderValidationMessage()}
        </div>
        {this.renderActionsPanel()}
      </div>
    );
  }
}

export default ValidationEditor;
