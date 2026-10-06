import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Svg, { Polyline, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { GeoPoint, smoothPoints } from '../../services/gps/geoUtils';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';

export type MapStyleType = 'dark' | 'streets' | 'satellite';

interface LiveRouteMapProps {
  routePoints: GeoPoint[];
  currentLocation?: GeoPoint | null;
  destinationLocation?: GeoPoint | null;
  plannedRoutePoints?: GeoPoint[];
  isSelectingDestination?: boolean;
  onSelectDestination?: (point: GeoPoint) => void;
  height?: number | string;
  isTracking?: boolean;
  onLocationFound?: (point: GeoPoint) => void;
  style?: StyleProp<ViewStyle>;
}

export function LiveRouteMap({
  routePoints = [],
  currentLocation = null,
  destinationLocation = null,
  plannedRoutePoints = [],
  isSelectingDestination = false,
  onSelectDestination,
  height = 260,
  isTracking = true,
  onLocationFound,
  style,
}: LiveRouteMapProps) {
  const { colors } = useTheme();

  const [mapStyle, setMapStyle] = useState<MapStyleType>('dark');
  const [isFollowMode, setIsFollowMode] = useState(true);
  const [userHasPanned, setUserHasPanned] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const iframeRef = useRef<any>(null);

  // Active anchor location (latest point or current location)
  const activeCoord = useMemo(() => {
    if (routePoints && routePoints.length > 0) {
      return routePoints[routePoints.length - 1];
    }
    if (currentLocation) {
      return currentLocation;
    }
    return null;
  }, [routePoints, currentLocation]);

  // Generate Leaflet HTML for web iframe
  const mapHtml = useMemo(() => {
    const initLat = activeCoord?.latitude || 0;
    const initLng = activeCoord?.longitude || 0;
    const hasInitial = !!activeCoord;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { box-sizing: border-box; }
    html, body, #map {
      margin: 0; padding: 0; width: 100%; height: 100%;
      background: #000000; overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    /* Strava-Style Pulsing Live Runner Marker */
    .runner-puck {
      position: relative;
      width: 24px;
      height: 24px;
    }
    .runner-puck-core {
      width: 16px;
      height: 16px;
      background: #007AFF;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(0, 122, 255, 0.9), 0 2px 6px rgba(0,0,0,0.6);
      position: absolute;
      top: 4px;
      left: 4px;
      z-index: 10;
    }
    .runner-puck-pulse {
      width: 32px;
      height: 32px;
      background: rgba(0, 122, 255, 0.4);
      border-radius: 50%;
      position: absolute;
      top: -4px;
      left: -4px;
      animation: pulse 1.6s infinite ease-out;
      z-index: 5;
    }
    @keyframes pulse {
      0% { transform: scale(0.5); opacity: 0.95; }
      100% { transform: scale(1.9); opacity: 0; }
    }
    /* Checkered Finish Flag Badge */
    .finish-flag-badge {
      background: #000000;
      color: #B8F500;
      font-weight: 900;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 10px;
      border: 2px solid #B8F500;
      box-shadow: 0 0 10px rgba(184, 245, 0, 0.6), 0 2px 8px rgba(0,0,0,0.6);
      white-space: nowrap;
      text-align: center;
      line-height: 14px;
      letter-spacing: 0.5px;
    }
    .dest-banner {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(184, 245, 0, 0.95);
      color: #000;
      font-weight: 900;
      font-size: 11px;
      padding: 6px 14px;
      border-radius: 20px;
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    /* Green Start Flag Badge */
    .start-badge {
      background: #34C759;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 10px;
      padding: 2px 7px;
      border-radius: 8px;
      border: 2px solid #FFFFFF;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      white-space: nowrap;
      text-align: center;
      line-height: 14px;
    }
    /* Leaflet UI adjustments */
    .leaflet-control-attribution {
      background: rgba(11, 16, 32, 0.7) !important;
      color: rgba(255,255,255,0.4) !important;
      font-size: 8px !important;
      padding: 1px 4px !important;
    }
    .leaflet-control-attribution a {
      color: rgba(255,255,255,0.6) !important;
      text-decoration: none;
    }
  </style>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body>
  <div id="map"></div>
  <div id="dest-banner" class="dest-banner" style="display: none;">
    🎯 Tap anywhere on the map to set Finish Line
  </div>
  <script>
    var map;
    var currentTileLayer;
    var currentLabelsLayer;
    var runnerMarker;
    var startMarker;
    var finishMarker;
    var routePolyline;
    var routeShadowPolyline;
    var plannedPolyline;
    var followMode = true;
    var isSelectingDest = false;
    var currentPos = ${hasInitial ? `[${initLat}, ${initLng}]` : 'null'};

    // Free, 100% watermark-free tile providers
    var TILE_LAYERS = {
      dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    };
    var DARK_LABELS_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}';

    var TILE_ATTRIBUTIONS = {
      dark: '&copy; Esri World Dark Gray &copy; OpenStreetMap',
      streets: '&copy; OpenStreetMap contributors',
      satellite: '&copy; Esri World Imagery'
    };

    function initMap() {
      var initialCenter = currentPos || [40.7128, -74.0060];
      var initialZoom = currentPos ? 16 : 13;

      map = L.map('map', {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: false,
        attributionControl: true
      });

      setMapStyle('${mapStyle}');

      // Runner custom icon
      var runnerIcon = L.divIcon({
        className: 'runner-div-icon',
        html: '<div class="runner-puck"><div class="runner-puck-pulse"></div><div class="runner-puck-core"></div></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      if (currentPos) {
        runnerMarker = L.marker(currentPos, { icon: runnerIcon }).addTo(map);
      }

      // Planned dashed guidance line (Cyan, Strava/MapMyRun guidance)
      plannedPolyline = L.polyline([], {
        color: '#00F0FF',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(map);

      // Route polyline (Glow + Solid Line)
      routeShadowPolyline = L.polyline([], {
        color: 'rgba(252, 76, 2, 0.4)',
        weight: 9,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(map);

      routePolyline = L.polyline([], {
        color: '#FC4C02', // Strava Vibrant Orange
        weight: 5,
        opacity: 0.95,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(map);

      // User interaction listener
      map.on('dragstart', function() {
        followMode = false;
        try {
          window.parent.postMessage({ type: 'USER_DRAGGED' }, '*');
        } catch(e) {}
      });

      // Destination selection on map click
      map.on('click', function(e) {
        if (isSelectingDest) {
          try {
            window.parent.postMessage({
              type: 'DESTINATION_SELECTED',
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            }, '*');
          } catch(err) {}
        }
      });

      // Browser Geolocation if no initial point
      if (!currentPos && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(pos) {
            var lat = pos.coords.latitude;
            var lng = pos.coords.longitude;
            currentPos = [lat, lng];
            map.setView(currentPos, 16);
            if (!runnerMarker) {
              runnerMarker = L.marker(currentPos, { icon: runnerIcon }).addTo(map);
            } else {
              runnerMarker.setLatLng(currentPos);
            }
            try {
              window.parent.postMessage({
                type: 'LOCATION_FOUND',
                latitude: lat,
                longitude: lng,
                accuracy: pos.coords.accuracy
              }, '*');
            } catch(e) {}
          },
          function(err) {
            console.warn('Geolocation lookup notice:', err);
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
        );
      }

      try {
        window.parent.postMessage({ type: 'MAP_READY' }, '*');
      } catch(e) {}
    }

    function setMapStyle(style) {
      if (currentTileLayer) {
        map.removeLayer(currentTileLayer);
        currentTileLayer = null;
      }
      if (currentLabelsLayer) {
        map.removeLayer(currentLabelsLayer);
        currentLabelsLayer = null;
      }

      var url = TILE_LAYERS[style] || TILE_LAYERS.dark;
      var attr = TILE_ATTRIBUTIONS[style] || TILE_ATTRIBUTIONS.dark;
      var subdomains = style === 'streets' ? 'abc' : '';

      currentTileLayer = L.tileLayer(url, {
        maxZoom: 19,
        subdomains: subdomains,
        attribution: attr
      }).addTo(map);

      // Add clear road and neighborhood labels layer for dark canvas
      if (style === 'dark') {
        currentLabelsLayer = L.tileLayer(DARK_LABELS_URL, {
          maxZoom: 19,
          opacity: 0.95
        }).addTo(map);
      }
    }

    function updatePoints(points, follow) {
      if (!points || !map) return;
      followMode = follow !== undefined ? follow : followMode;

      if (points.length === 0) return;

      var latLngs = points.map(function(p) { return [p.latitude, p.longitude]; });
      var latest = latLngs[latLngs.length - 1];
      currentPos = latest;

      // Update runner marker
      if (!runnerMarker) {
        var runnerIcon = L.divIcon({
          className: 'runner-div-icon',
          html: '<div class="runner-puck"><div class="runner-puck-pulse"></div><div class="runner-puck-core"></div></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        runnerMarker = L.marker(latest, { icon: runnerIcon }).addTo(map);
      } else {
        runnerMarker.setLatLng(latest);
      }

      // Update start marker
      if (points.length >= 2 && !startMarker) {
        var startIcon = L.divIcon({
          className: 'start-div-icon',
          html: '<div class="start-badge">START</div>',
          iconSize: [44, 18],
          iconAnchor: [22, 18]
        });
        startMarker = L.marker(latLngs[0], { icon: startIcon }).addTo(map);
      }

      // Update polylines
      if (latLngs.length >= 2) {
        routeShadowPolyline.setLatLngs(latLngs);
        routePolyline.setLatLngs(latLngs);
      }

      // Follow runner
      if (followMode && latest) {
        map.panTo(latest, { animate: true, duration: 0.6 });
      }
    }

    function updateDestination(dest) {
      if (!map) return;
      if (!dest) {
        if (finishMarker) {
          map.removeLayer(finishMarker);
          finishMarker = null;
        }
        return;
      }
      var latLng = [dest.latitude, dest.longitude];
      if (!finishMarker) {
        var finishIcon = L.divIcon({
          className: 'finish-div-icon',
          html: '<div class="finish-flag-badge">🏁 FINISH</div>',
          iconSize: [68, 22],
          iconAnchor: [34, 22]
        });
        finishMarker = L.marker(latLng, { icon: finishIcon }).addTo(map);
      } else {
        finishMarker.setLatLng(latLng);
      }
    }

    function updatePlannedRoute(points) {
      if (!map || !plannedPolyline) return;
      if (!points || points.length < 2) {
        plannedPolyline.setLatLngs([]);
        return;
      }
      var latLngs = points.map(function(p) { return [p.latitude, p.longitude]; });
      plannedPolyline.setLatLngs(latLngs);
    }

    function recenter() {
      followMode = true;
      if (currentPos && map) {
        map.flyTo(currentPos, 16, { duration: 0.8 });
      } else if (routePolyline && routePolyline.getLatLngs().length > 0) {
        map.fitBounds(routePolyline.getBounds(), { padding: [30, 30] });
      }
    }

    function fitRoute() {
      followMode = false;
      if (routePolyline && routePolyline.getLatLngs().length > 1) {
        map.fitBounds(routePolyline.getBounds(), { padding: [30, 30] });
      }
    }

    // Message receiver from React Native
    window.addEventListener('message', function(event) {
      var data = event.data;
      if (!data) return;

      if (data.type === 'UPDATE_ROUTE') {
        updatePoints(data.points, data.followUser);
      } else if (data.type === 'UPDATE_DESTINATION') {
        updateDestination(data.destination);
      } else if (data.type === 'UPDATE_PLANNED_ROUTE') {
        updatePlannedRoute(data.plannedRoute);
      } else if (data.type === 'SET_SELECTING_DESTINATION') {
        isSelectingDest = !!data.active;
        var mapEl = document.getElementById('map');
        var banner = document.getElementById('dest-banner');
        if (isSelectingDest) {
          mapEl.style.cursor = 'crosshair';
          if (banner) banner.style.display = 'block';
        } else {
          mapEl.style.cursor = '';
          if (banner) banner.style.display = 'none';
        }
      } else if (data.type === 'SET_STYLE') {
        setMapStyle(data.style);
      } else if (data.type === 'RECENTER') {
        recenter();
      } else if (data.type === 'FIT_ROUTE') {
        fitRoute();
      } else if (data.type === 'ZOOM_IN') {
        map.zoomIn();
      } else if (data.type === 'ZOOM_OUT') {
        map.zoomOut();
      }
    });

    window.addEventListener('DOMContentLoaded', initMap);
  </script>
</body>
</html>`;
  }, [mapStyle]);

  // Handle messages received from the map iframe
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleWindowMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data) return;

      if (data.type === 'MAP_READY') {
        setIsMapReady(true);
        // Dispatch current points and destination immediately upon readiness
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            {
              type: 'UPDATE_ROUTE',
              points: routePoints.length > 0 ? routePoints : (activeCoord ? [activeCoord] : []),
              followUser: isFollowMode,
            },
            '*'
          );
          if (destinationLocation) {
            iframeRef.current.contentWindow.postMessage(
              {
                type: 'UPDATE_DESTINATION',
                destination: destinationLocation,
              },
              '*'
            );
          }
          if (plannedRoutePoints.length > 0) {
            iframeRef.current.contentWindow.postMessage(
              {
                type: 'UPDATE_PLANNED_ROUTE',
                plannedRoute: plannedRoutePoints,
              },
              '*'
            );
          }
          iframeRef.current.contentWindow.postMessage(
            {
              type: 'SET_SELECTING_DESTINATION',
              active: isSelectingDestination,
            },
            '*'
          );
        }
      } else if (data.type === 'USER_DRAGGED') {
        setUserHasPanned(true);
        setIsFollowMode(false);
      } else if (data.type === 'DESTINATION_SELECTED') {
        if (onSelectDestination && data.latitude && data.longitude) {
          onSelectDestination({
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: Date.now(),
          });
        }
      } else if (data.type === 'LOCATION_FOUND') {
        if (onLocationFound && data.latitude && data.longitude) {
          onLocationFound({
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: data.accuracy || 10,
            timestamp: Date.now(),
          });
        }
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => {
      window.removeEventListener('message', handleWindowMessage);
    };
  }, [
    routePoints,
    activeCoord,
    isFollowMode,
    onLocationFound,
    onSelectDestination,
    destinationLocation,
    plannedRoutePoints,
    isSelectingDestination,
  ]);

  // Sync destination updates to iframe
  useEffect(() => {
    if (Platform.OS !== 'web' || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      {
        type: 'UPDATE_DESTINATION',
        destination: destinationLocation,
      },
      '*'
    );
  }, [destinationLocation]);

  // Sync planned route updates to iframe
  useEffect(() => {
    if (Platform.OS !== 'web' || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      {
        type: 'UPDATE_PLANNED_ROUTE',
        plannedRoute: plannedRoutePoints,
      },
      '*'
    );
  }, [plannedRoutePoints]);

  // Sync destination selection mode
  useEffect(() => {
    if (Platform.OS !== 'web' || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      {
        type: 'SET_SELECTING_DESTINATION',
        active: isSelectingDestination,
      },
      '*'
    );
  }, [isSelectingDestination]);

  // Push route points and follow mode updates to the iframe
  useEffect(() => {
    if (Platform.OS !== 'web' || !iframeRef.current?.contentWindow) return;

    const pointsToSend =
      routePoints.length > 0
        ? routePoints
        : activeCoord
        ? [activeCoord]
        : [];

    iframeRef.current.contentWindow.postMessage(
      {
        type: 'UPDATE_ROUTE',
        points: pointsToSend,
        followUser: isFollowMode,
      },
      '*'
    );
  }, [routePoints, activeCoord, isFollowMode]);

  // Change Map Style (Dark / Streets / Satellite)
  const handleChangeStyle = (style: MapStyleType) => {
    setMapStyle(style);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'SET_STYLE', style }, '*');
    }
  };

  // Re-center on user
  const handleRecenter = () => {
    setIsFollowMode(true);
    setUserHasPanned(false);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'RECENTER' }, '*');
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'ZOOM_IN' }, '*');
    }
  };

  const handleZoomOut = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'ZOOM_OUT' }, '*');
    }
  };

  // Fit all route bounds
  const handleFitRoute = () => {
    setIsFollowMode(false);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'FIT_ROUTE' }, '*');
    }
  };

  // Height computation
  const computedHeight = isExpanded ? 460 : height;

  return (
    <View
      style={[
        styles.container,
        {
          height: computedHeight as any,
          backgroundColor: '#000000',
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef}
          srcDoc={mapHtml}
          title="Live GPS Runner Map"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: 20,
            backgroundColor: '#000000',
          } as any}
        />
      ) : (
        /* Native Fallback SVG Polyline */
        <View style={styles.nativeFallback}>
          <Text style={{ color: '#FFF' }}>GPS Map active</Text>
        </View>
      )}

      {/* Top Map Layer Selector Overlay */}
      <View style={styles.topLayerBar}>
        <View style={styles.stylePillContainer}>
          {(['dark', 'streets', 'satellite'] as const).map((styleOption) => (
            <TouchableOpacity
              key={styleOption}
              style={[
                styles.stylePill,
                mapStyle === styleOption && styles.stylePillActive,
              ]}
              onPress={() => handleChangeStyle(styleOption)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.stylePillText,
                  mapStyle === styleOption && styles.stylePillTextActive,
                ]}
              >
                {styleOption === 'dark' ? 'DARK' : styleOption === 'streets' ? 'STREETS' : 'SAT'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Expand / Minimize Toggle */}
        <TouchableOpacity
          style={styles.iconCircleBtn}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.8}
          accessibilityLabel={isExpanded ? 'Collapse map' : 'Expand map'}
        >
          <Icon name={isExpanded ? 'close' : 'sparkle'} size={13} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Floating Bottom-Right Controls (Re-Center, Zoom, Fit) */}
      <View style={styles.rightControlsCol}>
        <TouchableOpacity
          style={styles.iconCircleBtn}
          onPress={handleZoomIn}
          activeOpacity={0.8}
          accessibilityLabel="Zoom In"
        >
          <Text style={styles.zoomBtnText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconCircleBtn}
          onPress={handleZoomOut}
          activeOpacity={0.8}
          accessibilityLabel="Zoom Out"
        >
          <Text style={styles.zoomBtnText}>−</Text>
        </TouchableOpacity>

        {routePoints.length >= 2 && (
          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={handleFitRoute}
            activeOpacity={0.8}
            accessibilityLabel="Fit Route"
          >
            <Icon name="progress" size={13} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.recenterPillBtn,
            isFollowMode ? styles.recenterPillActive : styles.recenterPillInactive,
          ]}
          onPress={handleRecenter}
          activeOpacity={0.8}
          accessibilityLabel="Re-center on Runner"
        >
          <Icon
            name="target"
            size={13}
            color={isFollowMode ? '#000000' : '#B8F500'}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.recenterPillText,
              { color: isFollowMode ? '#000000' : '#B8F500' },
            ]}
          >
            {isFollowMode ? 'FOLLOWING' : 'RE-CENTER'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom-Left Live GPS Signal Badge */}
      <View style={styles.bottomStatusBadge}>
        <View style={styles.livePulseDot} />
        <Text style={styles.liveStatusText}>
          {activeCoord
            ? `LIVE GPS • ${activeCoord.latitude.toFixed(4)}, ${activeCoord.longitude.toFixed(4)}`
            : 'ACQUIRING LIVE GPS...'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  nativeFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topLayerBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    pointerEvents: 'box-none',
    zIndex: 100,
  },
  stylePillContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(11, 16, 32, 0.85)',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  stylePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stylePillActive: {
    backgroundColor: '#FC4C02', // Strava Orange
  },
  stylePillText: {
    color: '#A3A3A3',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stylePillTextActive: {
    color: '#FFFFFF',
  },
  iconCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(11, 16, 32, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  zoomBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  rightControlsCol: {
    position: 'absolute',
    right: 12,
    bottom: 38,
    alignItems: 'flex-end',
    gap: 8,
    zIndex: 100,
  },
  recenterPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  recenterPillActive: {
    backgroundColor: '#B8F500',
    borderColor: '#B8F500',
  },
  recenterPillInactive: {
    backgroundColor: 'rgba(11, 16, 32, 0.9)',
    borderColor: '#B8F500',
  },
  recenterPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomStatusBadge: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 16, 32, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 100,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#34C759',
    marginRight: 6,
    boxShadow: '0 0 6px #34C759',
  },
  liveStatusText: {
    color: '#E5E5E5',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
