# Create Storybook Story

You are creating a Storybook story for a component.

## TASK

Add a new Storybook story to document and test a component.

## STEPS

1. Locate or create component:
   - Check if component exists in `client/src/components/`
   - Create component if needed first
2. Create story file:
   - Place in `stories/` directory
   - Naming: `ComponentName.stories.tsx`
   - Follow existing story patterns
3. Define stories:
   - Default story showing basic usage
   - Variant stories for different states
   - Interactive stories if applicable
   - Edge case stories
4. Add controls and args:
   - Use Storybook controls for props
   - Add argTypes for better documentation
   - Use decorators if needed
5. Add accessibility testing:
   - Use `@storybook/addon-a11y` if available
   - Document accessibility features
6. Test the story:
   - Run `pnpm storybook`
   - Verify all variants render correctly
   - Check accessibility warnings

## OUTPUT

Provide:

- Complete story file
- Story variants defined
- Controls configuration
- Accessibility notes
