

## Plan: Replace text logo with uploaded image logo

### Changes

1. **Save uploaded logo** as `src/assets/logo.jpg`

2. **Update `src/components/Header.tsx`**:
   - Import `logo` from `@/assets/logo.jpg`
   - Replace `<span className="font-display text-xl md:text-2xl font-semibold text-foreground">Podróżówka</span>` with `<img src={logo} alt="Podróżówka" className="h-7 md:h-10 w-auto" />`

3. **Update `src/components/Footer.tsx`**:
   - Import `logo` from `@/assets/logo.jpg`
   - Replace `<h3 className="font-display text-2xl font-bold mb-4">Podróżówka</h3>` with `<img src={logo} alt="Podróżówka" className="h-10 w-auto mb-4" />`

