# Live Analysis Refactored Structure

This document explains the refactored structure of the Live Analysis feature for better maintainability and debugging.

## File Structure

```
src/
├── components/
│   └── live-analysis/
│       ├── BodyHeatmap.js          # Body heatmap visualization
│       ├── CameraControls.js       # Camera/video upload controls
│       ├── MetricsDisplay.js       # Metrics and recommendations display
│       └── VideoCanvas.js          # Video feed and canvas overlay
├── hooks/
│   ├── useLiveAnalysis.js          # Main state management hook
│   └── usePoseDetection.js         # Pose detection logic hook
├── pages/athlete/
│   ├── LiveAnalysis.js             # Original (long) implementation
│   └── LiveAnalysisRefactored.js   # New refactored implementation
└── utils/
    └── liveAnalysisUtils.js        # Shared constants and utilities
```

## Components

### 1. BodyHeatmap.js
- **Purpose**: Renders the body heatmap with risk indicators and angle measurements
- **Props**: `metrics` - Current pose metrics
- **Features**: 
  - Color-coded risk visualization
  - Angle display on each joint
  - Risk level labels

### 2. CameraControls.js
- **Purpose**: Handles camera/video mode switching and controls
- **Props**: Mode state, loading state, handler functions
- **Features**:
  - Camera/video tab switching
  - Start/stop controls
  - Camera selection
  - File upload handling

### 3. MetricsDisplay.js
- **Purpose**: Shows live metrics, heatmap, and recommendations
- **Props**: Metrics, analysis state, helper functions
- **Features**:
  - Live metrics debug display
  - Body heatmap integration
  - Movement recommendations
  - Loading/waiting states

### 4. VideoCanvas.js
- **Purpose**: Displays video feed with canvas overlay
- **Props**: Video/canvas refs, mode, loading/error states
- **Features**:
  - Responsive video container
  - Canvas overlay for pose detection
  - Loading indicators
  - Error handling
  - Usage instructions

## Hooks

### 1. useLiveAnalysis.js
- **Purpose**: Main state management for the live analysis feature
- **Returns**: All state variables, refs, and utility functions
- **Features**:
  - State management (mode, loading, metrics, etc.)
  - Risk level calculation
  - Recommendations generation
  - Cleanup functions

### 2. usePoseDetection.js
- **Purpose**: Handles pose detection initialization and processing
- **Parameters**: All required state setters and handlers
- **Returns**: Camera and video handling functions
- **Features**:
  - MediaPipe initialization
  - Camera stream handling
  - Video file processing
  - Pose analysis callbacks

## Utilities

### liveAnalysisUtils.js
- **Constants**: Risk thresholds, joint thresholds, camera constraints
- **Functions**: Risk level calculation, color helpers, validation functions
- **Purpose**: Centralized utilities to avoid code duplication

## Benefits of Refactoring

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other parts of the app
3. **Testability**: Smaller components are easier to unit test
4. **Debugging**: Issues can be isolated to specific components
5. **Maintainability**: Changes are localized and don't affect other parts
6. **Performance**: Components can be optimized individually
7. **Code Organization**: Clear separation of concerns

## Usage

To use the refactored version, replace the import in your routing:

```javascript
// Before
import LiveAnalysis from './pages/athlete/LiveAnalysis';

// After
import LiveAnalysis from './pages/athlete/LiveAnalysisRefactored';
```

## Migration

The refactored version maintains the same API and functionality as the original. All props and behavior remain identical, making it a drop-in replacement.

## Debugging

With the refactored structure, you can:

1. **Isolate issues**: Check individual components in isolation
2. **Add logging**: Insert console.logs in specific hooks or components
3. **Test components**: Use React DevTools to inspect component state
4. **Profile performance**: Identify which components are re-rendering
5. **Mock data**: Test components with mock metrics/state

## Future Enhancements

The modular structure makes it easy to add:

- Component-specific error boundaries
- Individual component testing
- Performance optimization (React.memo, useMemo)
- Feature flags for different components
- A/B testing of different implementations
- Progressive loading of heavy components
