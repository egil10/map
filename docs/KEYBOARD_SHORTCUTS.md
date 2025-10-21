# GeoQuest Keyboard Shortcuts Guide

## Overview

GeoQuest includes comprehensive keyboard shortcuts for enhanced user experience and accessibility. All shortcuts are designed to work across different game modes and provide quick access to common functions.

## Complete Shortcut List

### Core Navigation
- **Enter**: Submit guess (Play Mode)
- **H**: Show hint
- **S**: Skip current quiz
- **R**: Restart game (reset score)
- **N**: Start new quiz immediately
- **ESC**: Clear country selection

## Detailed Shortcut Descriptions

### Enter Key
- **Function**: Submit guess
- **Mode**: Play Mode only
- **Behavior**: 
  - Submits the current text input as a guess
  - Triggers answer validation
  - Advances to next question or shows feedback
- **Context**: Only active when in Play Mode with text input focused

### H Key (Hint)
- **Function**: Show hint
- **Mode**: All modes
- **Behavior**:
  - Displays a random tag from the current dataset
  - Provides contextual clues about the data
  - Can be used multiple times per quiz
- **Visual Feedback**: Hint appears in the feedback area

### S Key (Skip)
- **Function**: Skip current quiz
- **Mode**: All modes
- **Behavior**:
  - Immediately loads a new random dataset
  - Resets current quiz state
  - Maintains game progress
- **Use Case**: When current quiz is too difficult or not interesting

### R Key (Restart)
- **Function**: Restart game
- **Mode**: All modes
- **Behavior**:
  - Resets all game state
  - Clears score and progress
  - Returns to initial game state
  - Maintains current game mode
- **Warning**: This action cannot be undone

### N Key (New Quiz)
- **Function**: Start new quiz immediately
- **Mode**: All modes
- **Behavior**:
  - Loads a new random dataset
  - Maintains current game state
  - Preserves score and progress
- **Use Case**: When you want a different dataset but keep progress

### ESC Key (Escape)
- **Function**: Clear country selection
- **Mode**: All modes
- **Behavior**:
  - Deselects any highlighted countries on the map
  - Resets map to default view
  - Clears any visual selections
- **Use Case**: When map becomes cluttered with selections

## Mode-Specific Behavior

### Play Mode
- **Enter**: Submits text input as guess
- **H**: Shows hint for current dataset
- **S**: Skips to new dataset
- **R**: Restarts entire game
- **N**: Loads new dataset
- **ESC**: Clears map selections

### Multiple Choice Mode
- **Enter**: Not applicable (buttons handle submission)
- **H**: Shows hint for current dataset
- **S**: Skips to new dataset
- **R**: Restarts entire game
- **N**: Loads new dataset
- **ESC**: Clears map selections

### Learn Mode
- **Enter**: Not applicable (browsing mode)
- **H**: Shows hint for current dataset
- **S**: Advances to next dataset
- **R**: Restarts learn mode
- **N**: Loads new random dataset
- **ESC**: Clears map selections

## Accessibility Features

### Keyboard Navigation
- All shortcuts work without mouse interaction
- Consistent behavior across all game modes
- Visual feedback for all shortcut actions
- No conflicts with standard browser shortcuts

### Screen Reader Support
- Shortcuts are announced by screen readers
- ARIA labels indicate available shortcuts
- Focus management for keyboard users
- Clear indication of shortcut availability

### Motor Accessibility
- Large key targets (standard keyboard keys)
- No complex key combinations required
- Consistent key behavior
- Alternative mouse/touch options available

## Implementation Details

### Event Handling
```javascript
// Keyboard shortcut implementation
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' && e.key !== 'Enter' && e.key !== 'Escape') {
        return; // Don't interfere with typing in input fields
    }
    
    switch (e.key) {
        case 'Enter':
            if (this.gameMode === 'play' && !this.isLearnMode) {
                e.preventDefault();
                this.handleSubmitGuess();
            }
            break;
        case 'h':
        case 'H':
            e.preventDefault();
            this.showHint();
            break;
        // ... other shortcuts
    }
});
```

### Conflict Prevention
- Shortcuts don't interfere with text input
- Browser shortcuts are preserved
- Game-specific shortcuts only active in game context
- Clear visual feedback for all actions

## User Experience Guidelines

### Learning Curve
- Shortcuts are intuitive and memorable
- Single key shortcuts for common actions
- Consistent behavior across all modes
- Visual indicators for available shortcuts

### Efficiency
- Quick access to common functions
- No need to reach for mouse
- Streamlined workflow for power users
- Maintains game flow and immersion

### Discoverability
- Shortcuts are documented in help
- Visual cues indicate available actions
- Progressive disclosure of advanced features
- Context-sensitive help available

## Troubleshooting

### Common Issues

#### Shortcuts Not Working
- **Cause**: Input field focused
- **Solution**: Click outside input field or press ESC
- **Prevention**: Shortcuts disabled when typing

#### Conflicting Shortcuts
- **Cause**: Browser shortcuts interfering
- **Solution**: Use game-specific shortcuts only
- **Prevention**: Proper event handling and prevention

#### Accessibility Issues
- **Cause**: Screen reader conflicts
- **Solution**: Proper ARIA labels and focus management
- **Prevention**: Accessibility testing and validation

### Debug Mode
```javascript
// Enable debug logging for shortcuts
localStorage.setItem('debug-shortcuts', 'true');

// Check shortcut availability
console.log('Available shortcuts:', {
    enter: 'Submit guess',
    h: 'Show hint',
    s: 'Skip quiz',
    r: 'Restart game',
    n: 'New quiz',
    escape: 'Clear selection'
});
```

## Best Practices

### For Users
1. **Learn Gradually**: Start with basic shortcuts (H, S, R)
2. **Practice**: Use shortcuts regularly to build muscle memory
3. **Context Awareness**: Understand when shortcuts are available
4. **Accessibility**: Use shortcuts for better accessibility

### For Developers
1. **Consistency**: Maintain consistent shortcut behavior
2. **Documentation**: Keep shortcut documentation updated
3. **Testing**: Test shortcuts across all game modes
4. **Accessibility**: Ensure shortcuts work with assistive technology

## Future Enhancements

### Planned Shortcuts
- **Arrow Keys**: Navigate between multiple choice options
- **Tab**: Cycle through interactive elements
- **Space**: Select multiple choice option
- **Ctrl+Z**: Undo last action
- **Ctrl+S**: Save current progress

### Advanced Features
- **Custom Shortcuts**: User-defined shortcut preferences
- **Shortcut Hints**: On-screen shortcut indicators
- **Gesture Support**: Touch gesture equivalents
- **Voice Commands**: Voice-activated shortcuts

## Testing and Validation

### Automated Testing
```javascript
// Test shortcut functionality
describe('Keyboard Shortcuts', () => {
    test('H key shows hint', async () => {
        await page.keyboard.press('h');
        await expect(page.locator('[data-testid="hint"]')).toBeVisible();
    });
    
    test('S key skips quiz', async () => {
        await page.keyboard.press('s');
        await expect(page.locator('[data-testid="new-quiz"]')).toBeVisible();
    });
});
```

### Manual Testing
1. **Basic Functionality**: Test each shortcut in all modes
2. **Conflict Resolution**: Ensure no browser conflicts
3. **Accessibility**: Test with screen readers and keyboard navigation
4. **Performance**: Verify shortcuts don't impact game performance

## Conclusion

The GeoQuest keyboard shortcuts provide a comprehensive and accessible way to interact with the application. They enhance user experience, improve accessibility, and provide power users with efficient navigation options.

The shortcuts are designed to be intuitive, consistent, and non-intrusive, ensuring they enhance rather than complicate the user experience. Regular testing and user feedback help maintain the quality and effectiveness of the shortcut system.

---

This keyboard shortcuts guide provides complete documentation for all available shortcuts in the GeoQuest application, ensuring users can take full advantage of the keyboard navigation features.
