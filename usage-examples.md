# OnlyFor Component with onlyAnonymous Property

## Overview

The `OnlyFor` component has been enhanced with a new `onlyAnonymous` property that allows content to be shown only to anonymous (non-logged-in) users. This is particularly useful for static generated sites that use the MarkdownParser component under paths like `/lesson/<slug>` or `/interactive-coding-tutorial/<slug>` where you want to show certain content only to visitors who haven't signed up or logged in.

## New Property

### `onlyAnonymous` (boolean)
- **Default**: `false`
- **Purpose**: When set to `true`, the component will only render its children if the user is NOT authenticated
- **Behavior**: 
  - If `onlyAnonymous` is `true` and user is not logged in → show content
  - If `onlyAnonymous` is `true` and user is logged in → hide content (with optional banner)
  - If `onlyAnonymous` is `false` → use existing logic (academy, capabilities, etc.)

## Usage Examples

### Basic Anonymous-Only Content

```jsx
import OnlyFor from '../components/OnlyFor';

// This content will only be visible to anonymous users
<OnlyFor onlyAnonymous={true}>
  <div>
    <h2>Sign up now to get started!</h2>
    <p>Join thousands of students learning to code.</p>
    <Button onClick={() => router.push('/signup')}>
      Get Started Free
    </Button>
  </div>
</OnlyFor>
```

### Anonymous-Only Content with Banner

```jsx
// When logged-in users visit, they'll see a banner instead of the content
<OnlyFor onlyAnonymous={true} withBanner={true}>
  <div>
    <h2>Free Trial Available</h2>
    <p>This lesson is available for free to new users.</p>
  </div>
</OnlyFor>
```

### In MarkdownParser Components

For lessons and tutorials that should show promotional content to anonymous users:

```jsx
// In /lesson/[slug]/index.jsx or /interactive-coding-tutorial/[slug]/index.jsx
function LessonPage({ lesson }) {
  return (
    <div>
      {/* Main lesson content */}
      <MarkdownParser content={lesson.content} />
      
      {/* Anonymous-only promotional content */}
      <OnlyFor onlyAnonymous={true}>
        <Box 
          bg="blue.50" 
          p={6} 
          borderRadius="lg" 
          border="2px solid" 
          borderColor="blue.200"
        >
          <h3>Want to continue learning?</h3>
          <p>Sign up for free to access more lessons and track your progress!</p>
          <Button colorScheme="blue" onClick={() => router.push('/signup')}>
            Create Free Account
          </Button>
        </Box>
      </OnlyFor>
      
      {/* Content for logged-in users */}
      <OnlyFor onlyMember={true}>
        <Box>
          <h3>Your Progress</h3>
          <ProgressBar />
        </Box>
      </OnlyFor>
    </div>
  );
}
```

### Combined with Other Properties

The `onlyAnonymous` property takes precedence over other properties:

```jsx
// This will show content ONLY to anonymous users, 
// regardless of academy or capabilities
<OnlyFor 
  onlyAnonymous={true}
  academy={1}
  capabilities={['read_lesson']}
>
  <p>This shows only to anonymous users</p>
</OnlyFor>
```

## Implementation Details

### Authentication Logic

The component uses the `useAuth` hook to determine authentication status:

```javascript
const { isAuthenticated } = useAuth();

if (onlyAnonymous) {
  return !isAuthenticated ? children : (
    <Component withBanner={withBanner}>
      {children}
    </Component>
  );
}
```

### Use Cases

1. **Marketing CTAs**: Show sign-up prompts to anonymous users
2. **Free Content Teasers**: Display limited content with upgrade prompts
3. **Trial Offers**: Present special offers to non-registered users
4. **Public Landing Pages**: Show different content based on authentication status
5. **SEO-Friendly Content**: Ensure search engines can index public content while showing different experience to users

### Best Practices

1. **Use with `withBanner={false}`** for completely hidden content
2. **Use with `withBanner={true}`** when you want logged-in users to know content exists but is not for them
3. **Combine with responsive design** for better mobile experience
4. **Include clear CTAs** in anonymous-only content to drive conversions
5. **Test both states** (anonymous and authenticated) during development

### Browser Behavior

- **Static Generation**: Content is rendered server-side, then client-side hydration determines final visibility
- **SEO**: Anonymous content is indexable by search engines
- **Performance**: No additional API calls needed - uses existing auth context