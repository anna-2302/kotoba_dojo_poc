/**
 * Theme System Verification Script
 * Run this in browser console to verify unified theme system
 */

console.log('=== Kotoba Dojo Theme System Verification ===');

// Check localStorage keys
console.log('\n1. LocalStorage Keys:');
console.log('  kd.theme:', localStorage.getItem('kd.theme'));
console.log('  kd.mode:', localStorage.getItem('kd.mode'));
console.log('  Legacy darkMode:', localStorage.getItem('darkMode'));
console.log('  Legacy visualTheme:', localStorage.getItem('visualTheme'));

// Check DOM attributes
console.log('\n2. DOM Attributes:');
console.log('  data-theme:', document.documentElement.getAttribute('data-theme'));
console.log('  data-mode:', document.documentElement.getAttribute('data-mode'));
console.log('  .dark class:', document.documentElement.classList.contains('dark'));

// Check if theme utilities are available
console.log('\n3. Theme System Health:');
const expectedTheme = localStorage.getItem('kd.theme') || 'mizuiro';
const expectedMode = localStorage.getItem('kd.mode') || 'day';
const actualTheme = document.documentElement.getAttribute('data-theme');
const actualMode = document.documentElement.getAttribute('data-mode');
const darkClass = document.documentElement.classList.contains('dark');

const themeMatch = expectedTheme === actualTheme;
const modeMatch = expectedMode === actualMode;
const darkClassCorrect = (expectedMode === 'night') === darkClass;

console.log('  Theme sync:', themeMatch ? '✅ OK' : '❌ MISMATCH');
console.log('  Mode sync:', modeMatch ? '✅ OK' : '❌ MISMATCH');
console.log('  Dark class:', darkClassCorrect ? '✅ OK' : '❌ MISMATCH');

// Test theme combinations
console.log('\n4. Valid Theme Combinations:');
const combinations = [
  'mizuiro-day',
  'mizuiro-night', 
  'sakura-day',
  'sakura-night'
];
combinations.forEach(combo => {
  const [theme, mode] = combo.split('-');
  console.log(`  ${combo}: theme="${theme}", mode="${mode}"`);
});

// Current combination
const currentCombo = `${actualTheme}-${actualMode}`;
console.log('\n5. Current Combination:', currentCombo);
console.log('  Valid:', combinations.includes(currentCombo) ? '✅ YES' : '❌ NO');

// Check if CSS custom properties exist
console.log('\n6. CSS Custom Properties (sample):');
const root = getComputedStyle(document.documentElement);
const sampleProps = [
  '--kd-bg',
  '--kd-surface',
  '--kd-text-primary',
  '--kd-primary',
  '--kd-accent'
];
sampleProps.forEach(prop => {
  const value = root.getPropertyValue(prop).trim();
  console.log(`  ${prop}:`, value ? '✅ Defined' : '❌ Missing');
});

console.log('\n=== Verification Complete ===');
