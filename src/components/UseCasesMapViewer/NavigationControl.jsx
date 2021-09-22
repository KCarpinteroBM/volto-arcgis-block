import React, { createRef } from 'react';

class NavigationControl extends React.Component {
  constructor(props) {
    super(props);
    this.map = props.map;
    this.view = props.view;
    this.center = props.center;
    this.layerControl = props.layerControl;
  }

  /**
   *  Establish the initial behavior
   * @param {*} infoWidget
   */
  showWorld(infoWidget) {
    this.layerControl.hideLayer('layerSpatial');
    this.layerControl.showLayer('layerRegion');
    this.view.center.latitude = this.center[1];
    this.view.center.longitude = this.center[0];
    this.view.zoom = 1;
    infoWidget.setState({ useCaseLevel: 1 });
  }

  /**
   * When the user clicks on a region point, the map zooms to region.
   * The layer changes to use cases level.
   * InfoWidget shows the summary of use cases for the region
   * @param {*} boundingBox
   * @param {*} layerRegion
   * @param {*} layerSpatial
   * @param {*} infoWidget
   */
  navigateToRegion(boundingBox, infoWidget) {
    this.layerControl.zoomToExtent(boundingBox);
    this.layerControl.hideLayer('layerRegion');
    this.layerControl.showLayer('layerSpatial');
    // infoWidget.state.useCaseLevel = 2;
  }

  /**
   * When the user clicks on a use case location, the layers are deactivated, only a point at the location is shown and the contour of the country/organization.
   * The information about use cases is displayed on infoWidget.
   */
  navigateToLocation() { }

  clearBBOX(stringBbox) {
    let floatBbox = [];

    stringBbox = stringBbox.replace('[', '');
    stringBbox = stringBbox.replace(']', '');
    stringBbox = stringBbox.split(',');

    for (let number in stringBbox)
      floatBbox.push(parseFloat(stringBbox[number]));

    return floatBbox;
  }

  /**
   * Returns to the previous status.
   */
  returnToPrevious(infoWidget) {
    switch (infoWidget.state.previousState == infoWidget.state.useCaseLevel ? infoWidget.state.useCaseLevel - 1 : infoWidget.state.previousState) {
      case 1:
        this.showWorld(infoWidget);
        break;

      case 2:
        let boundingBox = this.clearBBOX(infoWidget.state.selectedUseCase.BBOX);
        this.navigateToRegion(boundingBox, infoWidget);
        infoWidget.setState({ useCaseLevel: 2, region: infoWidget.state.selectedUseCase.Region });
        break;

      default:
        this.showWorld(infoWidget);
        break;
    }
  }
}

export default NavigationControl;
