import React, { createRef } from 'react';
//import "@arcgis/core/assets/esri/css/main.css";
//import "./css/ArcgisMap.css";
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { loadModules } from 'esri-loader';

var Graphic, Extent, FeatureLayer, GroupLayer;

class AreaWidget extends React.Component {
  /**
   * Creator of the Measurement widget class
   * @param {*} props
   */
  constructor(props) {
    super(props);
    //We create a reference to a DOM element to be mounted
    this.container = this.props.download
      ? document.querySelector('#download_panel')
      : createRef();
    //Initially, we set the state of the component to
    //not be showing the basemap panel
    this.state = { showMapMenu: false };
    this.menuClass =
      'esri-icon-cursor-marquee esri-widget--button esri-widget esri-interactive';
    // Enable defaultPopup option to charge popup and highlifght feature
    this.props.mapViewer.view.popup.defaultPopupTemplateEnabled = true;
  }

  loader() {
    return loadModules([
      'esri/Graphic',
      'esri/geometry/Extent',
      'esri/layers/FeatureLayer',
      'esri/layers/GroupLayer',
    ]).then(([_Graphic, _Extent, _FeatureLayer, _GroupLayer]) => {
      [Graphic, Extent, FeatureLayer, GroupLayer] = [
        _Graphic,
        _Extent,
        _FeatureLayer,
        _GroupLayer,
      ];
    });
  }

  /**
   * Method that will be invoked when the
   * button is clicked. It controls the open
   * and close actions of the component
   */
  openMenu() {
    if (this.state.showMapMenu) {
      this.props.mapViewer.setActiveWidget();
      this.container.current.querySelector('.area-panel').style.display =
        'none';
      this.container.current
        .querySelector('.esri-widget--button')
        .classList.replace('esri-icon-right-arrow', 'esri-icon-cursor-marquee');
      // By invoking the setState, we notify the state we want to reach
      // and ensure that the component is rendered again
      this.setState({ showMapMenu: false });
      this.clearWidget();
      this.container.current.querySelector(
        '#download_area_select_nuts0',
      ).checked = true;
    } else {
      this.props.mapViewer.setActiveWidget(this);
      this.container.current.querySelector('.area-panel').style.display =
        'block';
      this.container.current
        .querySelector('.esri-widget--button')
        .classList.replace('esri-icon-cursor-marquee', 'esri-icon-right-arrow');
      // By invoking the setState, we notify the state we want to reach
      // and ensure that the component is rendered again
      this.setState({ showMapMenu: true });
      this.container.current.querySelector('input:checked').click();
    }
  }
  nuts0handler(e) {
    this.loadNutsService(e.target.value, 0);
  }
  nuts1handler(e) {
    this.loadNutsService(e.target.value, 1);
  }
  nuts3handler(e) {
    this.loadNutsService(e.target.value, 3);
  }
  loadNutsService(id, level) {
    this.clearWidget();

    var url =
      'https://bm-eugis.tk/arcgis/rest/services/CLMS/NUTS_2021/MapServer/0';
    var layer = new FeatureLayer({
      url: url,
      id: id,
      outFields: ['*'],
      popupEnabled: true,
      definitionExpression: 'LEVL_CODE=' + level,
    });
    this.nutsGroupLayer.add(layer);
  }
  rectanglehandler() {
    this.clearWidget();
    var fillSymbol = {
      type: 'simple-fill',
      color: [255, 255, 255, 0.5],
      outline: {
        color: [0, 0, 0],
        width: 1,
      },
    };

    let extentGraphic = null;
    let origin = null;
    const drawGraphics = this.props.view.on('drag', (e) => {
      e.stopPropagation();
      if (e.action === 'start') {
        if (extentGraphic) this.props.view.graphics.remove(extentGraphic);
        origin = this.props.view.toMap(e);
      } else if (e.action === 'update') {
        if (extentGraphic) this.props.view.graphics.remove(extentGraphic);
        let p = this.props.view.toMap(e);
        extentGraphic = new Graphic({
          geometry: new Extent({
            xmin: Math.min(p.x, origin.x),
            xmax: Math.max(p.x, origin.x),
            ymin: Math.min(p.y, origin.y),
            ymax: Math.max(p.y, origin.y),
            spatialReference: { wkid: 102100 },
          }),
          symbol: fillSymbol,
        });
        this.props.getCoords({ origin: e.origin, end: { x: e.x, y: e.y } });
        this.props.view.graphics.add(extentGraphic);
      }
    });
    this.setState({ ShowGraphics: drawGraphics });
  }
  clearWidget() {
    this.props.mapViewer.view.popup.close();
    if (this.state.ShowGraphics) {
      this.state.ShowGraphics.remove();
      this.setState({ ShowGraphics: null });
      this.props.getCoords({});
    }
    this.nutsGroupLayer.removeAll();
    this.props.view.graphics.removeAll();
  }
  /**
   * This method is executed after the rener method is executed
   */
  async componentDidMount() {
    await this.loader();
    this.nutsGroupLayer = new GroupLayer({
      title: 'nuts',
      opacity: 0.5,
    });
    this.props.map.add(this.nutsGroupLayer);
    this.props.download
      ? this.props.view.ui.add(this.container)
      : this.props.view.ui.add(this.container.current, 'top-right');
  }
  /**
   * This method renders the component
   * @returns jsx
   */
  render() {
    return (
      <>
        <div ref={this.container} className="area-container">
          {!this.props.download && (
            <div
              className={this.menuClass}
              id="map_area_button"
              title="Area"
              onClick={this.openMenu.bind(this)}
              onKeyDown={this.openMenu.bind(this)}
              tabIndex="0"
              role="button"
            ></div>
          )}
          <div className="area-panel">
            <div className="ccl-form">
              <fieldset className="ccl-fieldset">
                <div className="map-download-header">
                  <legend className="ccl-form-legend">
                    <span className="map-download-header-title">
                      Select area
                    </span>
                    <span className="info-icon" tooltip="Info" direction="up">
                      <i className="fas fa-info-circle"></i>
                    </span>
                  </legend>
                </div>
                <div className="ccl-form-group">
                  <input
                    type="radio"
                    id="download_area_select_nuts0"
                    name="downloadAreaSelect"
                    value="nuts0"
                    className="ccl-checkbox cl-required ccl-form-check-input"
                    defaultChecked
                    onClick={this.nuts0handler.bind(this)}
                  ></input>
                  <label
                    className="ccl-form-radio-label"
                    htmlFor="download_area_select_nuts0"
                  >
                    <span>NUTS 0</span>
                  </label>
                </div>
                <div className="ccl-form-group">
                  <input
                    type="radio"
                    id="download_area_select_nuts1"
                    name="downloadAreaSelect"
                    value="nuts1"
                    className="ccl-checkbox ccl-required ccl-form-check-input"
                    onClick={this.nuts1handler.bind(this)}
                  ></input>
                  <label
                    className="ccl-form-radio-label"
                    htmlFor="download_area_select_nuts1"
                  >
                    <span>NUTS 1</span>
                  </label>
                </div>
                <div className="ccl-form-group">
                  <input
                    type="radio"
                    id="download_area_select_nuts3"
                    name="downloadAreaSelect"
                    value="nuts3"
                    className="ccl-radio ccl-required ccl-form-check-input"
                    onClick={this.nuts3handler.bind(this)}
                  ></input>
                  <label
                    className="ccl-form-radio-label"
                    htmlFor="download_area_select_nuts3"
                  >
                    <span>NUTS 3</span>
                  </label>
                </div>
                <div className="ccl-form-group">
                  <input
                    type="radio"
                    id="download_area_select_rectangle"
                    name="downloadAreaSelect"
                    value="area"
                    className="ccl-radio ccl-required ccl-form-check-input"
                    onClick={this.rectanglehandler.bind(this)}
                  ></input>
                  <label
                    className="ccl-form-radio-label"
                    htmlFor="download_area_select_rectangle"
                  >
                    <span>By rectangle</span>
                    <div>
                      (Mantain the left button of the mouse clicked and draw a
                      rectangle in the map)
                    </div>
                  </label>
                </div>
                <div>
                  {/* <div class="map-download-resource">
                    <div class="ccl-form">
                      <div class="map-download-header">
                        <label for="download_area_select" class="map-download-header-title">Download resource as</label>
                        <span class="info-icon" tooltip="Info" direction="up">
                          <FontAwesomeIcon
                            className="map-menu-icon"
                            icon={['fas', 'info-circle']}
                          />
                        </span>
                      </div>
                      <div class="ccl-select-container">
                        <div class="ccl-select-container">
                          <select class="ccl-select" id="download_area_select" name="" >
                            <option value="option1">GeoTiff</option>
                            <option value="option2">ESRI Geodatabase</option>
                            <option value="option3">SQLite Database</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </>
    );
  }
}
export default AreaWidget;
