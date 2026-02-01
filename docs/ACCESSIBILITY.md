# Accessibility Guide

Repstack is committed to providing an accessible experience for all users, regardless of their abilities or the assistive technologies they use. This document outlines our accessibility features and testing practices.

## WCAG 2.1 AA Compliance

Repstack follows the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.

### Perceivable

**Color Contrast**
- Text meets a minimum contrast ratio of 4.5:1 against backgrounds
- UI components and graphical objects meet a minimum contrast ratio of 3:1
- Color is not used as the only visual means of conveying information

**Text Alternatives**
- All non-decorative images have appropriate alt text
- Decorative icons use `aria-hidden="true"` to hide them from screen readers
- Icons used for navigation include descriptive `aria-label` attributes

**Adaptable Content**
- Semantic HTML elements are used throughout
- Content can be presented in different ways without losing information
- Text can be resized up to 200% without loss of content or functionality

**Reduced Motion**
- Respects `prefers-reduced-motion` media query
- Animations are reduced or eliminated for users who prefer reduced motion

**High Contrast**
- Supports high contrast mode through `prefers-contrast` media query
- Colors are adjusted for better visibility in high contrast environments

### Operable

**Keyboard Navigation**
- All functionality is available via keyboard
- Logical tab order follows visual flow
- No keyboard traps
- Skip link allows users to bypass navigation and jump to main content
- Visible focus indicators on all interactive elements (2px blue outline with 2px offset)

**Focus Management**
- Dialogs and modals trap focus within them
- Focus returns to trigger element when closing modals
- Focus moves to first interactive element when opening dialogs

**Sufficient Time**
- Rest timer provides controls to extend or skip
- No automatic timeouts that cannot be adjusted

**Navigation**
- Consistent navigation across all pages
- Current page is indicated with `aria-current="page"`
- Skip link available on all pages
- Multiple ways to navigate (header nav, mobile nav)

### Understandable

**Language**
- HTML `lang` attribute is set to "en"

**Predictable**
- Navigation is consistent across all pages
- Components behave predictably

**Input Assistance**
- All form inputs have associated labels
- Required fields are clearly marked with asterisks and `aria-required="true"`
- Error messages are descriptive and announced to screen readers
- Form validation provides clear feedback

### Robust

**Valid HTML**
- Semantic HTML5 elements used throughout
- ARIA attributes used correctly and only when necessary

**ARIA Attributes**
- Proper roles assigned to custom components
- `aria-label` and `aria-labelledby` used for labeling
- `aria-live` regions for dynamic content announcements
- `aria-modal` and proper dialog markup

**Screen Reader Support**
- Status messages announced with `aria-live` regions
- Dynamic content changes are announced appropriately
- Loading states communicated to screen readers

## Component-Specific Accessibility

### Navigation
- Desktop and mobile navigation both fully keyboard accessible
- Current page indicated with `aria-current="page"`
- Mobile navigation has `aria-label="Mobile navigation"`
- Icons marked as decorative with `aria-hidden="true"`

### Dialogs/Modals
- All dialogs have `role="dialog"` and `aria-modal="true"`
- Dialogs are labeled with `aria-labelledby` pointing to title
- Focus trapped within dialog when open
- ESC key closes dialogs
- Focus returns to trigger element on close

### Forms
- All inputs have associated labels
- Required fields marked with `aria-required="true"`
- Error messages have `role="alert"` and `aria-live="polite"`
- Form groups use `<fieldset>` and `<legend>` where appropriate

### Rest Timer
- Time remaining announced periodically to screen readers
- Completion status announced
- All controls have descriptive `aria-label` attributes
- Button labels describe action clearly

### Set Logger
- Each set is a `role="group"` with descriptive label
- All inputs have `aria-label` attributes
- Previous performance data labeled appropriately
- Completion state announced

### Workout Feedback
- Rating scales use `role="radiogroup"`
- Individual ratings have descriptive `aria-label` attributes
- Recovery status buttons use `aria-pressed` for toggle state

## Testing

### Automated Testing
We use axe-core for automated accessibility testing:

```bash
npm run test:e2e
```

Our test suite includes:
- WCAG 2.1 A and AA rule checking
- Color contrast verification
- ARIA attribute validation
- Keyboard navigation testing
- Focus management testing

### Manual Testing

**Keyboard Navigation**
1. Use Tab to navigate forward
2. Use Shift+Tab to navigate backward
3. Use Enter/Space to activate buttons
4. Use Arrow keys for radio groups
5. Use ESC to close modals

**Screen Readers**
We test with:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)

**Browser Testing**
- Chrome (with axe DevTools extension)
- Firefox (with accessibility inspector)
- Safari (with VoiceOver)

## Best Practices for Contributors

When contributing to Repstack, please follow these accessibility guidelines:

### HTML
- Use semantic HTML elements (`<nav>`, `<main>`, `<button>`, etc.)
- Don't use `<div>` or `<span>` for interactive elements
- Ensure proper heading hierarchy (h1 → h2 → h3)

### Forms
- Always associate labels with inputs using `htmlFor` and `id`
- Mark required fields with `required` attribute and `aria-required="true"`
- Provide helpful error messages with `role="alert"`
- Use appropriate input types and `inputMode` for mobile keyboards

### Interactive Elements
- Buttons must have min height/width of 44px (already set in CSS)
- Provide descriptive `aria-label` for icon-only buttons
- Use `aria-hidden="true"` for decorative icons
- Implement keyboard handlers for custom interactive elements

### Dynamic Content
- Use `aria-live` regions for status updates
- Announce loading states to screen readers
- Ensure loading spinners have appropriate text alternatives

### Focus Management
- Never use `outline: none` without providing alternative focus indicator
- Trap focus in modals/dialogs
- Return focus to trigger element when closing modals
- Ensure focus is visible and has sufficient contrast

### Color and Contrast
- Don't rely on color alone to convey information
- Ensure text has minimum 4.5:1 contrast ratio
- Ensure UI components have minimum 3:1 contrast ratio
- Test with high contrast mode

### Testing Before Submitting
1. Navigate entire feature using only keyboard
2. Run automated accessibility tests
3. Test with a screen reader if possible
4. Check color contrast with browser DevTools

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)
- [WebAIM Articles](https://webaim.org/articles/)
- [Inclusive Components](https://inclusive-components.design/)

## Reporting Accessibility Issues

If you encounter accessibility issues while using Repstack:

1. Check if the issue exists in the latest version
2. Open a GitHub issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Assistive technology/browser used
   - WCAG criteria affected

We're committed to fixing accessibility issues promptly.

## Roadmap

Future accessibility improvements:
- [ ] Keyboard shortcuts customization
- [ ] Voice control support improvements
- [ ] Additional language support (i18n)
- [ ] Screen reader testing with more devices
- [ ] User testing with people with disabilities
