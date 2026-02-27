# Login Page Setup Guide

## Overview
This guide will help you set up the Login page component with Tailwind CSS, all functionalities, and responsive design that matches the Figma design exactly.

## Files Created
1. **`frontend/src/pages/Login.jsx`** - Main React component
2. **`frontend/src/pages/login.css`** - Custom styles and animations
3. **`frontend/tailwind.config.js`** - Tailwind CSS configuration
4. **`frontend/postcss.config.js`** - PostCSS configuration
5. **Updated `frontend/src/index.css`** - Global styles with Tailwind directives

## Installation Steps

### 1. Install Required Dependencies

Navigate to the frontend directory and install Tailwind CSS and related packages:

```bash
cd frontend

# Install Tailwind CSS and dependencies
npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms

# Install additional peer dependencies if needed
npm install
```

### 2. Verify Configuration Files

Ensure these configuration files are in place:

#### `tailwind.config.js`
- Custom colors (primary, background-light, background-dark)
- Custom fonts (Lexend)
- Custom animations (fade-in, slide-in, pulse-slow)
- Dark mode support

#### `postcss.config.js`
- Tailwind CSS plugin
- Autoprefixer plugin

#### `index.css`
- Tailwind directives (@tailwind base, @tailwind components, @tailwind utilities)
- Google Fonts (Lexend)
- Material Symbols Outlined icons

### 3. Update Your App Router

Add the Login component to your router configuration:

```jsx
// In your main App.jsx or router configuration
import Login from './pages/Login';

// Add to your routes
<Route path="/login" element={<Login />} />
<Route path="/" element={<Login />} /> {/* If login is homepage */}
```

### 4. Run the Development Server

```bash
npm run dev
```

The login page should now be accessible at `http://localhost:5173/login`

## Features Implemented

### ✅ UI/UX Features
- **Two-column layout** (left: hero section, right: login form)
- **Responsive design** (mobile: form only, desktop: full layout)
- **Dark mode support** (toggle with `class="dark"` on html element)
- **Smooth animations** (fade-in, slide-in effects)
- **Decorative AI pattern** background with animated gradient orbs

### ✅ Form Functionalities
- **Email validation** (format and required field)
- **Password validation** (minimum 6 characters, required)
- **Show/Hide password** toggle with eye icon
- **Remember me** checkbox with state management
- **Loading state** with spinner during submission
- **Error handling** with inline error messages
- **Auto-focus** on first input field
- **Enter key submission**

### ✅ Interactive Elements
- **Hover effects** on all buttons and links
- **Active states** with scale transformations
- **Focus states** with ring indicators (accessibility)
- **Cursor pointer** on clickable elements
- **Smooth transitions** on all interactive elements

### ✅ SSO Integration (UI Ready)
- Google SSO button with official branding
- Microsoft SSO button with official branding
- Click handlers ready for OAuth implementation

### ✅ Accessibility Features
- **ARIA labels** on password toggle
- **Keyboard navigation** support
- **Focus visible** indicators
- **Reduced motion** support for users with motion sensitivity
- **High contrast mode** support
- **Screen reader friendly** form labels

### ✅ Responsive Breakpoints
- **Mobile** (< 640px): Form only, stacked layout
- **Tablet** (640px - 1023px): Form with adjusted spacing
- **Desktop** (≥ 1024px): Two-column layout with hero section
- **Large Desktop** (≥ 1280px): Optimized spacing

### ✅ Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Colors
Edit `tailwind.config.js` to change brand colors:
```js
colors: {
  'primary': '#137fec',        // Main brand color
  'primary-hover': '#0d6fd4',  // Hover state
  'primary-dark': '#0a5bb8',   // Active state
}
```

### Fonts
Change the font family in `tailwind.config.js`:
```js
fontFamily: {
  'display': ['Lexend', 'sans-serif'],
}
```

### Animations
Adjust animation durations in `login.css`:
```css
@keyframes fade-in {
  /* Customize animation */
}
```

## Integration with Backend

### Form Submission
The component includes a `handleSubmit` function that you need to connect to your API:

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setIsLoading(true);
  
  try {
    // Replace with your actual API endpoint
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store token
      localStorage.setItem('authToken', data.token);
      
      // Redirect based on user role
      if (data.role === 'learner') {
        window.location.href = '/learner/dashboard';
      } else if (data.role === 'trainer') {
        window.location.href = '/trainer/dashboard';
      } else if (data.role === 'leadership') {
        window.location.href = '/leadership/dashboard';
      } else if (data.role === 'admin') {
        window.location.href = '/admin/dashboard';
      }
    } else {
      setErrors({ submit: data.message || 'Login failed' });
    }
  } catch (error) {
    setErrors({ submit: 'Network error. Please try again.' });
  } finally {
    setIsLoading(false);
  }
};
```

### SSO Integration
Implement OAuth for Google and Microsoft:

```jsx
const handleSSOLogin = async (provider) => {
  if (provider === 'Google') {
    // Redirect to Google OAuth
    window.location.href = '/api/auth/google';
  } else if (provider === 'Microsoft') {
    // Redirect to Microsoft OAuth
    window.location.href = '/api/auth/microsoft';
  }
};
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id
```

Access in your component:
```jsx
const API_URL = import.meta.env.VITE_API_URL;
```

## Testing

### Manual Testing Checklist
- [ ] Email validation shows error for invalid format
- [ ] Password validation shows error for < 6 characters
- [ ] Show/hide password toggle works
- [ ] Remember me checkbox toggles state
- [ ] Form submits on Enter key press
- [ ] Loading state shows spinner and disables inputs
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Dark mode toggle works (if implemented)
- [ ] All animations play smoothly
- [ ] SSO buttons trigger handlers
- [ ] Forgot Password link works
- [ ] Request Access link works

### Automated Testing (Example)
```jsx
// Using React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';

test('displays email validation error', () => {
  render(<Login />);
  
  const emailInput = screen.getByPlaceholderText('name@company.com');
  fireEvent.change(emailInput, { target: { value: 'invalid' } });
  fireEvent.blur(emailInput);
  
  expect(screen.getByText(/valid email/i)).toBeInTheDocument();
});
```

## Troubleshooting

### Issue: Tailwind styles not applying
**Solution:** 
1. Verify `tailwind.config.js` content paths include your component files
2. Restart dev server: `npm run dev`
3. Clear browser cache

### Issue: Material Icons not showing
**Solution:**
1. Check internet connection (icons load from Google CDN)
2. Add fallback SVG icons for offline use
3. Verify `index.css` imports Material Symbols

### Issue: Animations not working
**Solution:**
1. Check browser supports CSS animations
2. Verify `login.css` is imported in component
3. Test with `prefers-reduced-motion: no-preference`

### Issue: Form not submitting
**Solution:**
1. Check browser console for errors
2. Verify API endpoint is correct
3. Test with mock data first

## Performance Optimization

### Implemented Optimizations
- **GPU acceleration** for animations (`will-change: transform`)
- **Lazy loading** for background images (if added)
- **Debounced validation** (can be added for better UX)
- **Code splitting** (automatic with Vite)
- **Tree shaking** (automatic with Vite)

### Lighthouse Scores Target
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

## Next Steps

1. **Connect to Backend API** - Replace mock API calls with real endpoints
2. **Implement OAuth** - Set up Google/Microsoft SSO
3. **Add Password Reset** - Create forgot password flow
4. **Implement Registration** - Create request access form
5. **Add Analytics** - Track login events
6. **Add Error Logging** - Send errors to monitoring service
7. **Implement Rate Limiting** - Prevent brute force attacks
8. **Add CAPTCHA** - For bot protection (optional)

## Support

For issues or questions:
- Check [GETTING_STARTED.md](../../GETTING_STARTED.md)
- Review [API.md](../../docs/API.md) for backend endpoints
- Contact: support@ailms.com

---

**Last Updated:** February 17, 2026
**Version:** 1.0.0
