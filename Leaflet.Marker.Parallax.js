L.Marker.Parallax = L.Marker.extend({

    _initIcon: function () {
        L.Marker.prototype._initIcon.call(this);
        var anchor = this.options.icon.options.iconAnchor ? L.point(this.options.icon.options.iconAnchor) : L.point([0,0]);
        this.options.icon._originalOffset = L.point(-anchor.x, -anchor.y);

    },
    onAdd: function (e) {
        L.Marker.prototype.onAdd.call(this, e);

        this._map.on('move', this._onMapMove, this);
        this._map.on('zoomstart', this._onZoomStart, this);

        this._onMapMove();
    },

    onRemove: function (e) {

        this._map.off('move', this._onMapMove, this);
        L.Marker.prototype.onRemove.call(this, e);

    },

    _onMapMove : function(e){
        var offsets = this._calculateOffsetFromOrigin();

        if(this._icon){
            this._updateIconOffset(offsets.centerOffset);
        }
    },

    _onZoomStart : function(e){
        var tempLatLng = this._calcLatLngFromOffset();
        var origLatLng = this.getLatLng();
        var origParallaxZoffset = this.options.parallaxZoffset;
        this.options.parallaxZoffset = 0;
        this.setLatLng(tempLatLng);

        map.once('zoomend', function(){ console.log('@ zoomend', tempLatLng, origLatLng); this.options.parallaxZoffset = origParallaxZoffset; this.setLatLng(origLatLng); this._onMapMove(); }, this);
    },

    _calcLatLngFromOffset: function(){
        var offsets = this._calculateOffsetFromOrigin();
        var parallax = this._calculateParallaxFromOffset(offsets.centerOffset);

        var containerPoint = offsets.containerPoint.add(parallax);
        var markerLatLng = this._map.containerPointToLatLng(containerPoint);

        console.log('@ containerPoint: ', containerPoint);

        console.log('@ got markerLatLng', markerLatLng);
        return markerLatLng;
    },

    _updateIconOffset: function(offset){

        if(!offset || ! this._icon){ return };

        var parallax = this._calculateParallaxFromOffset(offset);
        var originalOffset = this.options.icon._originalOffset;

        var newOffset = originalOffset.add(parallax);

        if (true) {
            this._icon.style.marginLeft = newOffset.x + 'px';
            this._icon.style.marginTop  = newOffset.y + 'px';
        }
    },

    //Find how much from the center of the map the marker is currently located
    _calculateOffsetFromOrigin: function(){
        if(!this._map){ return; };

        var latlng = this.getLatLng();
        var markerPoint = this._map.latLngToContainerPoint(latlng);
        var centerPoint = this._map.getSize().divideBy(2);
        //User centerPoint and markerPoint to calculate the distance from center

        var deltaX = (markerPoint.x - centerPoint.x);
        var deltaY = (markerPoint.y - centerPoint.y);

        var offset = {x: deltaX, y: deltaY};
        var containerPoint = markerPoint.add(offset);

        return {containerPoint: containerPoint, centerOffset: offset};
        // targetPoint = centerPoint.subtract([overlayWidth, 0]),
        // targetLatLng = map.containerPointToLatLng(centerPoint);
    },

    _calculateParallaxFromOffset: function(offset){
        var parallax = L.point([0,0]);

        if(!this.options.parallaxZoffset){
            return parallax;
        }


        //Multiplies the delta x with a factor depending on the map z.
        var z = this._map.getZoom();

        var constFactor = this.options.parallaxZoffset * 0.000001;
        var moveFactor = constFactor * Math.pow(2, z);

        parallax.x = offset.x * moveFactor;
        parallax.y = offset.y * moveFactor;


        return parallax;
    }
});

L.Marker.parallax = function(latlng, opts){ return new L.Marker.Parallax(latlng, opts); };
