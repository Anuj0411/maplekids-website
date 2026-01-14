# Language Popup Configuration

## Overview
The language selection popup can be configured to show either every time the page loads (for testing) or only once per user (for production). You can also control the delay time before the popup appears.

## Configuration File
Edit `src/config/languagePopup.ts`:

```typescript
// Set to true to show popup every time page loads (for testing)
// Set to false to show popup only once per user (production behavior)
export const SHOW_POPUP_EVERY_TIME = true;

// Popup delay in milliseconds (1000 = 1 second, 2500 = 2.5 seconds)
export const POPUP_DELAY_MS = 2500;
```

## Behavior Options

### Testing Mode (`SHOW_POPUP_EVERY_TIME = true`)
- ✅ Popup appears on every page reload
- ✅ Useful for testing the popup functionality
- ✅ Ignores saved language preference
- ✅ Always shows after configured delay (default: 2.5 seconds)

### Production Mode (`SHOW_POPUP_EVERY_TIME = false`)
- ✅ Popup appears only on first visit
- ✅ Remembers user's language choice
- ✅ Uses saved language on subsequent visits
- ✅ Better user experience for returning users
- ✅ Shows after configured delay (default: 2.5 seconds)

## Delay Configuration

### Current Setting
- **Delay**: 2.5 seconds (2500 milliseconds)
- **Behavior**: Popup appears 2.5 seconds after page load

### Customize Delay
Edit `POPUP_DELAY_MS` in `src/config/languagePopup.ts`:

```typescript
// Examples:
export const POPUP_DELAY_MS = 1000;  // 1 second
export const POPUP_DELAY_MS = 2000;  // 2 seconds
export const POPUP_DELAY_MS = 2500;  // 2.5 seconds (current)
export const POPUP_DELAY_MS = 3000;  // 3 seconds
export const POPUP_DELAY_MS = 5000;  // 5 seconds
```

## How to Switch Modes

### For Testing:
1. Open `src/config/languagePopup.ts`
2. Set `SHOW_POPUP_EVERY_TIME = true`
3. Save and refresh the page
4. Popup will appear every time

### For Production:
1. Open `src/config/languagePopup.ts`
2. Set `SHOW_POPUP_EVERY_TIME = false`
3. Save and build the project
4. Popup will only show once per user

## Testing the Popup

### Method 1: Configuration Toggle
- Set `SHOW_POPUP_EVERY_TIME = true`
- Refresh page multiple times
- Popup should appear each time

### Method 2: Clear Browser Storage
1. Open Developer Tools (F12)
2. Go to Application/Storage tab
3. Clear localStorage
4. Refresh page
5. Popup should appear

### Method 3: Incognito Mode
1. Open incognito/private window
2. Navigate to your app
3. Popup should appear

## Current Status
**Currently set to TESTING MODE** - Popup shows every time page loads.

To switch to production mode, change `SHOW_POPUP_EVERY_TIME` to `false` in `src/config/languagePopup.ts`.
