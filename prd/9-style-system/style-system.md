# PRD Section 9: Style System

This document defines the design tokens, color palette, typography, and animation standards for the CropGenius application, based on the `tailwind.config.ts` file.

## 1. Color Palette

Colors are defined semantically to represent core application concepts.

| Name | Usage | Tailwind Class / Shades |
| :--- | :--- | :--- |
| **Crop Green** | Primary actions, success states, logos, highlights. | `bg-crop-green-500`, `text-crop-green-700`, etc. (Shades: 50, 100, 500, 600, 700) |
| **Soil Brown** | Secondary text, borders, background elements. | `bg-soil-brown-500`, etc. (Shades: 50, 100, 500, 600, 700) |
| **Sky Blue** | Informational messages, links, active states. | `bg-sky-blue-500`, etc. (Shades: 50, 100, 500, 600, 700) |
| **Soft Cream** | Main application background, card backgrounds. | `bg-soft-cream-50`, etc. (Shades: 50, 100, 200, 300, 400) |

### Thematic Colors (via CSS Variables)
-   **`primary`**: `hsl(var(--primary))` - The main brand color, typically `crop-green`.
-   **`secondary`**: `hsl(var(--secondary))` - Used for less prominent elements.
-   **`destructive`**: `hsl(var(--destructive))` - For error messages and destructive actions.
-   **`background` / `foreground`**: The default background and text colors.

## 2. Typography

-   **Font Family:** (To be defined, will default to system sans-serif).
-   **Hierarchy:**
    -   `h1`, `h2`, `h3`: For page and section titles.
    -   `p`: For body text.
    -   `small`: For muted or secondary text.

## 3. Spacing & Sizing

-   Follows Tailwind's default spacing scale (multiples of 0.25rem).
-   Container padding is `2rem` by default.

## 4. Border Radius

-   **`rounded-lg`**: Default for cards and larger elements.
-   **`rounded-full`**: For circular elements like avatars.

## 5. Shadows & Elevation

-   **`shadow-god`**: The primary shadow style for elevated cards and modals.
-   **`shadow-god-sm` / `shadow-god-lg`**: Smaller and larger variants for different interaction states.

## 6. Animations & Micro-interactions

-   **`accordion-down` / `accordion-up`**: For collapsible content sections.
-   **`god-glow`**: A subtle, glowing effect for important, interactive elements.
-   **`god-float`**: A gentle floating animation to draw attention.
-   **`god-pulse`**: A pulsing effect for live or real-time indicators.

## 7. Custom Component Styles (via Plugin)

-   **`btn-god`**: The primary call-to-action button style. Includes a gradient, shadow, and hover/active states.
-   **`card-god`**: The standard card component, implementing the glassmorphism effect (`backdrop-blur`, semi-transparent background, border).
-   **`text-god`**: A gradient text style for prominent headlines.
-   **`glass-god`**: A utility class to apply the glassmorphism effect to any element.
