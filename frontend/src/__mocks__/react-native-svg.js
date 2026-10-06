const React = require('react');
const { View } = require('react-native');

const createSvgMockComponent = (name) => {
  const Component = (props) => React.createElement(View, { ...props, 'data-svg-component': name });
  Component.displayName = name;
  return Component;
};

module.exports = {
  __esModule: true,
  default: createSvgMockComponent('Svg'),
  Svg: createSvgMockComponent('Svg'),
  Circle: createSvgMockComponent('Circle'),
  Rect: createSvgMockComponent('Rect'),
  Path: createSvgMockComponent('Path'),
  G: createSvgMockComponent('G'),
  Defs: createSvgMockComponent('Defs'),
  LinearGradient: createSvgMockComponent('LinearGradient'),
  RadialGradient: createSvgMockComponent('RadialGradient'),
  Stop: createSvgMockComponent('Stop'),
  ClipPath: createSvgMockComponent('ClipPath'),
  Pattern: createSvgMockComponent('Pattern'),
  Mask: createSvgMockComponent('Mask'),
  Polyline: createSvgMockComponent('Polyline'),
  Polygon: createSvgMockComponent('Polygon'),
  Line: createSvgMockComponent('Line'),
  Text: createSvgMockComponent('Text'),
  TSpan: createSvgMockComponent('TSpan'),
  TextPath: createSvgMockComponent('TextPath'),
  Use: createSvgMockComponent('Use'),
  Symbol: createSvgMockComponent('Symbol'),
};
