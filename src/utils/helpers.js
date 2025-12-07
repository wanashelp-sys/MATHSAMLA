// Shared utility functions
// These functions are used across multiple components

/**
 * Convert English numbers to Arabic numbers
 * @param {string|number} str - The input string or number
 * @returns {string} - String with Arabic numerals
 */
export const toArabicNumbers = (str) => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(str).replace(/[0-9]/g, digit => arabicNumbers[digit]);
};

/**
 * Convert grade number to Arabic text
 * @param {number} grade - Grade number (1-6)
 * @returns {string} - Grade text in Arabic
 */
export const gradeNumberToText = (grade) => {
  const gradeMap = {
    1: "الصف الأول",
    2: "الصف الثاني",
    3: "الصف الثالث",
    4: "الصف الرابع",
    5: "الصف الخامس",
    6: "الصف السادس"
  };
  return gradeMap[grade] || "طالبة";
};

/**
 * Extract initials from Arabic name
 * @param {string} fullName - Full name in Arabic
 * @returns {string} - Initials (first letters of first and last name)
 */
export const getInitials = (fullName) => {
  if (!fullName) return "؟";
  const names = fullName.trim().split(/\s+/);
  if (names.length === 0) return "؟";
  const firstInitial = names[0].charAt(0);
  const lastInitial = names.length > 1 ? names[names.length - 1].charAt(0) : '';
  return firstInitial + lastInitial;
};

/**
 * Generate a random teacher code (6 characters)
 * @returns {string} - Random code using uppercase letters and numbers (excluding similar-looking characters)
 */
export const generateTeacherCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
