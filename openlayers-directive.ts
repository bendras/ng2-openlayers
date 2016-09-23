/// <reference path="../../../typings/index.d.ts" />

import { Directive, Input, AfterViewInit, OnChanges, ElementRef, SimpleChange } from '@angular/core';
import * as ol from 'openlayers';
import { ConfigurationService } from '../../services/configuration-service';

@Directive({
  selector: '[openlayers]'
})
export class OpenlayersDirective implements AfterViewInit { 
  private areaWktString: string;
  
  private olMap: ol.Map;
  private olWkt = new ol.format.WKT();
  private initialViewOnDelft: ol.View;
  private mapLayer: ol.layer.Tile;
  private vectorLayer: ol.layer.Vector;

  // https://openlayersbook.github.io/index.html
  constructor(private elementRefHoldingOpenlayersMap: ElementRef, configurationService: ConfigurationService) {
    this.initialViewOnDelft = new ol.View({
      projection: configurationService.getProjection(),
			center: configurationService.getInitialLocationOnMap(),
			zoom: 13
        });

    this.vectorLayer = new ol.layer.Vector();
    this.mapLayer = new ol.layer.Tile({ source: new ol.source.OSM() });
  }

  @Input() 
  set area(value: string) {
    this.areaWktString = value;
    this.drawArea(value);
  }

  ngAfterViewInit(): void {
    var mapOptions : olx.MapOptions = {
        target: this.elementRefHoldingOpenlayersMap.nativeElement,
        layers: [this.mapLayer, this.vectorLayer],
        view: this.initialViewOnDelft,
        interactions: ol.interaction.defaults({ altShiftDragRotate: false, doubleClickZoom: false, keyboard: false, mouseWheelZoom: false, shiftDragZoom:false, dragPan:false, pinchRotate:false, pinchZoom:false }) 
	    };
    this.olMap = new ol.Map(mapOptions);

    this.drawArea(this.areaWktString);
  }

  drawArea(wktString: string){
    if (this.olMap) {
      if (wktString && wktString.trim() != "") {
        // Add shape of the area to the map.
        let features = this.olWkt.readFeatures(wktString);
        var vectorSource = new ol.source.Vector({ features: features });
        this.vectorLayer.setSource(vectorSource);

        // Center the map on the area.
        this.olMap.getView().fit(vectorSource.getExtent(), this.olMap.getSize());

        this.elementRefHoldingOpenlayersMap.nativeElement.setAttribute("data-area", wktString);
      }
      else {
        this.vectorLayer.setSource(null);
        this.elementRefHoldingOpenlayersMap.nativeElement.setAttribute("data-area", "");        
      }
    }
  }
}