import React, { createRef } from 'react';

let layerControl,
  navigationControl,
  view,
  mapViewer,
  layerSpatial,
  layerNUTS,
  processedData = [];
class InfoWidget extends React.Component {
  constructor(props) {
    super(props);
    view = props.view;
    mapViewer = props.mapViewer;
    navigationControl = props.navigationControl;
    layerControl = props.layerControl;
    layerSpatial = props.layerSpatial;
    layerNUTS = props.layerNUTS;
    this.container = createRef();
  }

  /**
   * Renders lateral menu when a specific use case is selected
   * @param {Object} UseCase
   * @returns lateralMenu DOM
   */
  showUseCase(UseCase) {
    layerControl.getGeometry(UseCase.Spatial_coverage, layerNUTS);
    let responsibleOrganizationOrPerson = UseCase.Responsible_organisation
      ? UseCase.Responsible_organisation
      : UseCase.Contact_person_name_
      ? UseCase.Contact_person_name_
      : '';
    layerControl.showLayer(layerNUTS.id);
    return (
      <>
        <div className="use-cases-products-title">Use case detail</div>
        <div className="use-case-detail">
          <div className="use-case-detail-close">
            <span
              className="ccl-icon-close"
              aria-label="Close"
              aria-hidden="true"
              role="button"
              onClick={() => navigationControl.returnToPrevious()}
            ></span>
          </div>
          <div className="use-case-detail-image">
            <img
              src={
                UseCase.Link_to_image
                  ? UseCase.Link_to_image
                  : this.props.thumbnail
              }
              alt="Use Case"
            />
          </div>
          <div className="use-case-detail-content">
            <div className="use-case-detail-product">
              {UseCase.Copernicus_Land_Monitoring_Service_products_used}
            </div>
            <div className="use-case-detail-title">
              <h3>{UseCase.Use_case_title}</h3>
            </div>
            <div className="use-case-detail-info">
              <span>{UseCase.Use_case_topics}</span>
              <span>{UseCase.Use_case_submitting_production_year}</span>
              <span>{UseCase.Spatial_coverage}</span>
              <span>{responsibleOrganizationOrPerson}</span>
            </div>
            <div className="use-case-detail-description">
              <p>{UseCase.Use_case_summary}</p>
              {UseCase.Links_to_web_sites && (
                <p>
                  For further information
                  <a href={UseCase.Links_to_web_sites.split(' ')[0]}> here</a>.
                </p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  /**
   * Generates the DOM for selected region
   * @param {Object} data
   * @returns useCasesRegion
   */
  getDataBrief(data) {
    let children = data.map((val) => {
      let responsibleOrganizationOrPerson = val.Responsible_organisation
        ? val.Responsible_organisation
        : val.Contact_person_name_
        ? val.Contact_person_name_
        : '';
      return (
        <>
          <div
            key={val.Use_case_title}
            className="use-case-element"
            aria-hidden="true"
            onClick={() =>
              mapViewer.setState((prevState) => ({
                useCaseLevel: 4,
                selectedUseCase: val,
                previousState: prevState.useCaseLevel,
              }))
            }
            id={`use_case_${val.OBJECTID}`}
          >
            <div className="use-case-element-title">{val.Use_case_title}</div>
            <div className="use-case-element-description">
              <span>{val.Use_case_topics}</span>
              <span>{val.Use_case_submitting_production_year}</span>
              <span>{val.Spatial_coverage}</span>
              <span>{responsibleOrganizationOrPerson}</span>
            </div>
          </div>
        </>
      );
    });

    return <>{children}</>;
  }

  /**
   * Shows use cases brief information of selected region
   * @param {String} selectedRegion
   * @returns useCasesDOM
   */
  showBrief(selectedRegion) {
    let regionFeatures = [];
    if (mapViewer.state.useCaseLevel === 2) {
      for (let feature in this.features) {
        if (this.features[feature].attributes.Region === selectedRegion) {
          regionFeatures.push(this.features[feature].attributes);
        }
      }
      return (
        <div>
          <div className="use-cases-products-title">
            <span>{regionFeatures.length} </span>
            use cases
          </div>
          <div className="use-cases-products-list">
            <div key={selectedRegion} className="use-cases-dropdown">
              <button
                className="use-case-button-back"
                tabIndex="0"
                onClick={() => {
                  navigationControl.showWorld();
                }}
              >
                <span className="esri-icon-left-arrow"></span>
                Back
              </button>
              {this.getDataBrief(regionFeatures)}
            </div>
          </div>
        </div>
      );
    } else if (mapViewer.state.useCaseLevel === 3) {
      layerSpatial.definitionExpression !== null
        ? (layerSpatial.definitionExpression += ` AND Latitude = ${mapViewer.state.selectedUseCases[0].attributes.Latitude} AND Longitude = ${mapViewer.state.selectedUseCases[0].attributes.Longitude}`)
        : (layerSpatial.definitionExpression = `Latitude = ${mapViewer.state.selectedUseCases[0].attributes.Latitude} AND Longitude = ${mapViewer.state.selectedUseCases[0].attributes.Longitude}`);

      for (let feature in mapViewer.state.selectedUseCases) {
        regionFeatures.push(
          mapViewer.state.selectedUseCases[feature].attributes,
        );
      }
      return (
        <>
          <div className="use-cases-products-title">
            <span>{regionFeatures.length} </span>
            use cases
          </div>
          <div className="use-cases-products-list">
            <div key={selectedRegion} className="use-cases-dropdown">
              <button
                className="use-case-button-back"
                tabIndex="0"
                onClick={() => {
                  navigationControl.returnToPrevious();
                }}
              >
                <span className="esri-icon-left-arrow"></span>
                Back
              </button>
              {this.getDataBrief(regionFeatures)}
            </div>
          </div>
        </>
      );
    }
  }

  /**
   * Transfrom raw data to ordered data by Service products
   */
  proccessDataSummary() {
    let serviceProducts = this.getDifferentproductUsed(this.features);
    let elements = [];

    for (let serviceProduct in serviceProducts) {
      processedData[serviceProducts[serviceProduct]] = [];
    }

    for (let feature in this.features) {
      elements.push(this.features[feature].attributes);
    }

    for (let element in elements) {
      processedData[
        elements[element].Copernicus_Land_Monitoring_Service_products_used
      ].push(elements[element]);
    }
  }

  /**
   * Creates lateral menu ordered by specified ServiceProduct
   * @param {Object} data
   * @param {String} Copernicus_Land_Monitoring_Service_products_used
   * @returns lateralMenuDOM
   */
  getDataSummary(data, Copernicus_Land_Monitoring_Service_products_used) {
    let children = this.getDataBrief(data);

    return (
      <>
        <div
          key={Copernicus_Land_Monitoring_Service_products_used}
          className="use-cases-dropdown"
        >
          <div
            className="ccl-expandable__button"
            aria-expanded="false"
            onClick={this.toggleDropdownContent.bind(this)}
            onKeyDown={this.toggleDropdownContent.bind(this)}
            tabIndex="0"
            role="button"
          >
            {Copernicus_Land_Monitoring_Service_products_used}
          </div>
          <div className="use-cases-element-container">{children}</div>
        </div>
      </>
    );
  }

  /**
   * Method to toggle dropdown content
   * @param {Event} e
   */
  toggleDropdownContent(e) {
    let aria = e.target.getAttribute('aria-expanded');
    e.target.setAttribute('aria-expanded', aria === 'true' ? 'false' : 'true');
  }

  /**
   * Returns lateral menu
   * @returns lateralMenuDOM
   */
  setDOMSummary() {
    this.proccessDataSummary();
    let DOMElements = [];
    for (let product_use_name in processedData)
      DOMElements.push(
        this.getDataSummary(processedData[product_use_name], product_use_name),
      );

    return <>{DOMElements}</>;
  }

  /**
   * Returns all different service product names
   * @param {Array} features
   * @returns allServiceProductNames
   */
  getDifferentproductUsed(features) {
    let serviceProducts = [],
      oldFeatureName = '';

    for (let feature in features) {
      let currentCLMS =
        features[feature].attributes
          .Copernicus_Land_Monitoring_Service_products_used;
      if (
        currentCLMS !== oldFeatureName &&
        !serviceProducts.includes(currentCLMS)
      ) {
        serviceProducts.push(currentCLMS);
        oldFeatureName = currentCLMS;
      }
    }
    return serviceProducts;
  }

  /**
   * Shows summarized information of a whole set of use cases.
   */
  showSummary() {
    if (view !== undefined && this.features === undefined) {
      (async () => {
        let features = await layerSpatial
          .queryFeatures()
          .then((featureSet) => featureSet.features);
        features = layerControl.orderFeatures(features);

        this.features = features;

        mapViewer.setState((prevState) => ({
          useCaseLevel: 1,
          region: '',
          selectedUseCase: '',
          previousState: prevState.useCaseLevel,
        }));
      })();
    } else if (this.features !== undefined) {
      if (mapViewer.state.useCaseLevel !== 1) {
        mapViewer.setState((prevState) => ({
          useCaseLevel: 1,
          region: '',
          selectedUseCase: '',
          previousState: prevState.useCaseLevel,
        }));
      } else {
        return (
          <>
            <div className="use-cases-products-title">
              <span>{this.features.length} </span>
              use cases
            </div>
            <div className="use-cases-products-list">
              {this.setDOMSummary()}
            </div>
          </>
        );
      }
    } else {
      return <></>;
    }
  }

  /**
   * This method will return the corresponding lateral menu depending on layers.
   * @returns HTML
   */
  useCasesInformationPanel() {
    switch (mapViewer.state.useCaseLevel) {
      case 1:
        return this.showSummary();
      case 2:
        return this.showBrief(mapViewer.state.region);
      case 3:
        return this.showBrief(mapViewer.state.selectedUseCases);
      case 4:
        let title = mapViewer.state.selectedUseCase.Use_case_title;
        let bbox = mapViewer.state.selectedUseCase.BBOX;
        let region = mapViewer.state.selectedUseCase.Region;
        let country = mapViewer.state.selectedUseCase.Spatial_coverage;
        navigationControl.navigateToLocation(
          bbox,
          title,
          region,
          country,
          layerSpatial,
        );
        try {
          document
            .querySelector('.use-cases-products-list')
            .scrollTo({ top: 0, behavior: 'smooth' });
        } catch {}
        return this.showUseCase(mapViewer.state.selectedUseCase);
      default:
        return 0;
    }
  }

  /**
   * This method renders the component
   * @returns jsx
   */
  render() {
    return (
      <>
        <div className="use-cases-products-block cont-w-50">
          {this.useCasesInformationPanel()}
        </div>
      </>
    );
  }
}

export default InfoWidget;
