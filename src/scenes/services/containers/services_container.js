import React, { Component } from 'react';
import ServiceComponent from '../components/Service';
import serviceActions from 'store/services/actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter, Redirect } from 'react-router';
import { getSession } from 'libs/user-session';
import NotFoundScene from 'styled_scenes/NotFound';
import { Helmet } from 'react-helmet';
import { websiteUrl } from 'libs/config';
import I18nText from 'shared_components/I18nText';
import { getHeroImage, generateServiceSlug } from 'libs/Utils';
import { loadTrip } from 'libs/localStorage';
import tripActions from 'store/trips/actions';

class ServicesContainer extends Component {
  state = {
    recentlyAddedToTrip: undefined,
  };

  componentDidMount() {
    const service_id = this.props.match.params.id;
    this.props.fetch_service(service_id);
    const user = getSession();
    if (user != null) {
      this.props.fetchMyTrips();
    }
    this.props.setAddedToTripMessage(undefined);
  }

  componentWillUnmount() {
    this.props.resetServiceData();
  }

  onAddServiceToTrip = ({ trip, day }, isLoggedIn) => {
    this.props.addServiceToTrip({ trip, day }, isLoggedIn);
  };

  onAddServiceToNewTrip = () => {
    const user = getSession();
    if (user != null) {
      this.props.createNewTrip();
    } else {
      this.props.history.push('/login');
    }
  };

  render() {
    if (this.props.serviceFetchError.code === 404) {
      return <NotFoundScene />;
    } else {
      let helmet;
      const { service } = this.props;
      if (service._id) {
        const location = service.location ? service.location.city || service.location.state : '';
        const metaDescription = service.description
          ? I18nText.translate(service.description)
          : `${I18nText.translate(service.categories[0].names)}${service.location &&
              ` in ${location}`}`;
        const description = `${metaDescription.substring(
          0,
          Math.min(155, metaDescription.length),
        )}...`;
        const image = getHeroImage(service);
        const url = `${websiteUrl}${this.props.location.pathname}`;
        const title = `${I18nText.translate(service.title)}${service.location && `, ${location}`}`;
        const isIncorrectUrl =
          this.props.slug &&
          `${this.props.match.params.slug}_${this.props.match.params.id}` !== this.props.slug;

        helmet = (
          <Helmet>
            {this.props.slug && !isIncorrectUrl ? <link rel="canonical" href={url} /> : null}
            <title>{title} | Please.com</title>
            <meta name="description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={metaDescription} />
            {image && <meta property="og:image" content={image.files.hero.url} />}
          </Helmet>
        );

        if (isIncorrectUrl) {
          return <Redirect to={`/services/${this.props.slug}`} />;
        }
      }

      return (
        <React.Fragment>
          {helmet}
          <ServiceComponent
            {...this.props}
            onAddServiceToTrip={this.onAddServiceToTrip}
            onAddServiceToNewTrip={this.onAddServiceToNewTrip}
          />
        </React.Fragment>
      );
    }
  }
}

const mapStateToProps = state => {
  const service = state.services.service;
  const isLoggedIn = state.session.loggedIn;

  return {
    service,
    isLoggedIn,
    trips: state.services.trips.filter(trip => trip !== undefined),
    reviews: state.services.reviews,
    myUnpurchasedTrips: isLoggedIn ? state.trips.userTrips.unbookedTrips : [loadTrip()],
    serviceRecentlyAddedToTrip: state.services.serviceRecentlyAddedToTrip,
    serviceAlreadyAddedToTrip: state.services.serviceAlreadyAddedToTrip,
    isServiceUnavailableModalOpen: state.services.isServiceUnavailableModalOpen,
    abi: state.services.abi,
    isPageLoading: state.services.isPageLoading,
    isLoading: state.services.isUpdatingTrip || state.services.isCreatingTrip,
    serviceFetchError: state.services.serviceFetchError,
    slug: service._id && generateServiceSlug(service),
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      ...serviceActions,
      fetchMyTrips: tripActions.fetchUserTrips,
    },
    dispatch,
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(ServicesContainer));
