import React from 'react';
import { Button, Icon, Modal } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import styled from 'styled-components';

import { tripBookingStatuses } from '../actions';
import { CenterAlign } from '../../../libs/styled';

const ThankYouMsg = styled.h2`
  margin-top: 30px;
`;

class BookedSuccessfullyPopup extends React.Component {
  onClose = () => {
    this.props.history.push('/account/trips/planned');
  };

  render() {
    const { bookingStatus } = this.props;
    const show = bookingStatus === tripBookingStatuses.SUCCESS;
    return (
      <Modal centered={false} open={show} onClose={this.onClose} size="tiny">
        <Modal.Header>Payment Successful</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <CenterAlign>
              <Icon name="check circle outline" size="massive" color="green" />
              <ThankYouMsg>
                Thanks for booking with <Link to="/">Please.com</Link>
              </ThankYouMsg>
            </CenterAlign>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button
            positive
            labelPosition="right"
            icon="chevron right"
            content="My Planned Trips"
            onClick={this.onClose}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  bookingStatus: state.TripsReducer.bookingStatus,
});

export default connect(
  mapStateToProps,
  null
)(withRouter(BookedSuccessfullyPopup));
