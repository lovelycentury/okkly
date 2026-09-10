# Template

Skeleton for a component called `Example` (`okkly-example`). Replace the placeholder variables and modifiers with the real design, and keep only what the component needs. Read the closest existing stylesheet first; where it differs from this template, follow the existing code.

## `packages/design-system/src/components/Example/Example.scss`

```scss
@use "../../styles/mixins/layers.scss";

.okkly-example {
  @include layers.component() {
    --okkly-example-color: var(--okkly-text-primary);
    --okkly-example-background: var(--okkly-bg-surface-raised);
    --okkly-example-border-color: var(--okkly-border-subtle);
    --okkly-example-radius: 0.75rem;
    --okkly-example-padding: 1rem;

    display: flex;
    align-items: center;
    padding: var(--okkly-example-padding);
    border: var(--okkly-1px-in-rem) solid var(--okkly-example-border-color);
    border-radius: var(--okkly-example-radius);
    background: var(--okkly-example-background);
    color: var(--okkly-example-color);
    font-family: var(--okkly-font-family-sans);

    &--small {
      --okkly-example-padding: 0.5rem;
    }

    &--large {
      --okkly-example-padding: 1.5rem;
    }

    &--outlined {
      --okkly-example-background: transparent;
      --okkly-example-border-color: var(--okkly-border-strong);
    }

    &__label {
      font-size: var(--okkly-font-size-sm);
      line-height: var(--okkly-font-line-height-sm);
    }
  }
}
```
