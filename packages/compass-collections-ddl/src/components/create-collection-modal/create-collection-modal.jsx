import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ConfirmationModal from '@leafygreen-ui/confirmation-modal';
import Banner from '@leafygreen-ui/banner';

import { createCollection } from '../../modules/create-collection';
import { clearError } from '../../modules/error';
import { toggleIsVisible } from '../../modules/is-visible';

import CollectionFields from './collection-fields';
import styles from './create-collection-modal.less';

class CreateCollectionModal extends PureComponent {
  static propTypes = {
    error: PropTypes.object,
    clearError: PropTypes.func,
    createCollection: PropTypes.func.isRequired,
    isRunning: PropTypes.bool.isRequired,
    isVisible: PropTypes.bool.isRequired,
    serverVersion: PropTypes.string.isRequired,
    toggleIsVisible: PropTypes.func.isRequired
  }

  constructor() {
    super();
    this.state = { data: {}, submitDisabled: true };
  }

  onCancel = () => {
    return this.props.toggleIsVisible(false);
  }

  onConfirm = () => {
    this.props.createCollection(this.state.data);
  }

  onChange = (data) => {
    const submitDisabled = !(data.collection || '').trim();
    this.setState({data, submitDisabled});
  }

  renderError() {
    if (!this.props.error) {
      return;
    }

    return (<Banner variant="danger" dismissible onClose={this.props.clearError}>
      {this.props.error.message}
    </Banner>);
  }

  render() {
    console.log('*** styles', styles);
    return (
      <ConfirmationModal
        open
        title="Create Collection"
        open={this.props.isVisible}
        onConfirm={this.onConfirm}
        onCancel={this.onCancel}
        buttonText="Create Collection"
        submitDisabled={this.state.submitDisabled}
        className={styles['create-collection-modal']}
      >
        <CollectionFields
          serverVersion={this.props.serverVersion}
          withDatabase={false}
          onChange={this.onChange}/>
        {this.renderError()}
      </ConfirmationModal>
    );
  }
}

const mapStateToProps = (state) => ({
  isRunning: state.isRunning,
  isVisible: state.isVisible,
  error: state.error,
  serverVersion: state.serverVersion
});

const MappedCreateCollectionModal = connect(
  mapStateToProps,
  {
    createCollection,
    toggleIsVisible,
    clearError
  },
)(CreateCollectionModal);

export default MappedCreateCollectionModal;
export { CreateCollectionModal };
