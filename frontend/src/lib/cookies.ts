/**
 * Cookie utility functions for managing client-side cookies
 * Provides a simple interface for setting, getting, and removing cookies
 */

/**
 * Set a cookie with the specified name, value, and expiration days
 * @param name - The name of the cookie
 * @param value - The value to store in the cookie
 * @param days - Number of days until the cookie expires (default: 7)
 */
export function setCookie(name: string, value: string, days: number = 7): void {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  // Set cookie with SameSite=Lax for security and path=/ for accessibility across the site
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

/**
 * Get a cookie value by name
 * @param name - The name of the cookie to retrieve
 * @returns The cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  // Split all cookies and find the one matching our name
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    // Remove leading spaces
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    // Check if this cookie matches the name we're looking for
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  
  return null;
}

/**
 * Remove a cookie by name
 * @param name - The name of the cookie to remove
 */
export function removeCookie(name: string): void {
  // Set the cookie with an expiration date in the past to delete it
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
}
