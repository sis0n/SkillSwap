# Theme

SkillSwap supports two themes:

- Light Mode
- Dark Mode

The application should respect the user's preferred theme.

If no preference exists:

- Use the system theme.

Users can manually switch themes from the Settings page.

The selected theme should persist across sessions.

---

# Theme Strategy

Use semantic colors instead of hardcoded colors.

Example:

- Primary
- Secondary
- Background
- Surface
- Border
- Text Primary
- Text Secondary
- Success
- Warning
- Danger

Avoid referencing raw color values directly inside components.

Components should use semantic color tokens so both themes remain consistent.

---

# Light Theme

Characteristics:

- Bright backgrounds
- Dark text
- Soft shadows
- Subtle borders

The interface should feel clean, modern, and approachable.

---

# Dark Theme

Characteristics:

- Dark backgrounds
- Light text
- Reduced contrast where appropriate
- Softer shadows

The interface should remain comfortable for extended use without sacrificing readability.

---

# Theme Switching

Users should be able to:

- Follow System Theme
- Switch to Light Mode
- Switch to Dark Mode

The selected theme should be remembered for future visits.

---

# Components

Every reusable component must support both themes.

Examples:

- Navbar
- Sidebar
- Buttons
- Cards
- Forms
- Inputs
- Modals
- Dropdowns
- Tables
- Toast Notifications
- Tooltips
- Pagination

Avoid creating separate components for each theme.

Instead, use shared components that adapt based on the active theme.

---

# Accessibility

Both Light and Dark themes should:

- Meet WCAG contrast recommendations.
- Maintain readable typography.
- Preserve clear focus states.
- Use color as enhancement, not the only indicator of meaning.
