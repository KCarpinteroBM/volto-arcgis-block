import React, { createRef } from 'react';
import { loadModules } from 'esri-loader';
var BasemapGallery;

class BasemapWidget extends React.Component {
  /**
   * Creator of the Basemap widget class
   * @param {*} props
   */
  constructor(props) {
    super(props);
    //We create a reference to a DOM element to be mounted
    this.container = createRef();
    //Initially, we set the state of the component to
    //not be showing the basemap panel
    this.state = { showMapMenu: false };
    this.menuClass =
      'esri-icon-basemap esri-widget--button esri-widget esri-interactive';
    this.loadFirst = true;
  }

  loader() {
    return loadModules(['esri/widgets/BasemapGallery']).then(
      ([_BasemapGallery]) => {
        BasemapGallery = _BasemapGallery;
      },
    );
  }

  /**
   * Method that will be invoked when the
   * button is clicked. It controls the open
   * and close actions of the component
   */
  openMenu() {
    if (this.loadFirst) {
      document
        .querySelectorAll('.esri-basemap-gallery__item')[3]
        .setAttribute('aria-selected', true);
      document
        .querySelectorAll('.esri-basemap-gallery__item')[3]
        .classList.add('esri-basemap-gallery__item--selected');
      this.loadFirst = false;

      document
        .querySelector('.esri-basemap-gallery__item-container')
        .addEventListener(
          'click',
          (e) => {
            document
              .querySelectorAll('.esri-basemap-gallery__item')[3]
              .setAttribute('aria-selected', false);
            document
              .querySelectorAll('.esri-basemap-gallery__item')[3]
              .classList.remove('esri-basemap-gallery__item--selected');
          },
          {
            once: true,
          },
        );
    }

    if (this.state.showMapMenu) {
      this.props.mapViewer.setActiveWidget();
      this.basemapGallery.domNode.style.display = 'none';
      this.container.current
        .querySelector('.esri-widget--button')
        .classList.replace('esri-icon-close', 'esri-icon-basemap');
      // By invoking the setState, we notify the state we want to reach
      // and ensure that the component is rendered again
      this.setState({ showMapMenu: false });
    } else {
      this.props.mapViewer.setActiveWidget(this);
      this.basemapGallery.domNode.classList.add('basemap-gallery-container');
      this.basemapGallery.domNode.style.display = 'block';
      this.container.current
        .querySelector('.esri-widget--button')
        .classList.replace('esri-icon-basemap', 'esri-icon-close');
      // By invoking the setState, we notify the state we want to reach
      // and ensure that the component is rendered again
      this.setState({ showMapMenu: true });
    }
  }
  /**
   * This method is executed after the rener method is executed
   */
  async componentDidMount() {
    await this.loader();
    if (!this.container.current) return;
    this.basemapGallery = new BasemapGallery({
      view: this.props.view,
      container: this.container.current.querySelector('.basemap-panel'),
    });
    this.props.view.ui.add(this.container.current, 'top-right');
  }
  /**
   * This method renders the component
   * @returns jsx
   */
  render() {
    return (
      <>
        <div ref={this.container} className="basemap-container">
          <div
            // ref={this.basemaps}
            className={this.menuClass}
            id="map_basemap_button"
            role="button"
            title="Basemap gallery"
            onClick={this.openMenu.bind(this)}
            onKeyDown={() => this.openMenu.bind(this)}
            tabIndex={0}
          ></div>
          <div className="basemap-panel"></div>
        </div>
      </>
    );
    //</div>
  }
}

export default BasemapWidget;
