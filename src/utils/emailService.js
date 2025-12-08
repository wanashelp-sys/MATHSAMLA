// Centralized email service configuration
// Initializes EmailJS once and provides reusable email functions
import emailjs from 'emailjs-com';

// EmailJS configuration
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_tv0lnvr';
const TEACHER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEACHER_TEMPLATE_ID || 'template_3doz3mf';
const STUDENT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_STUDENT_TEMPLATE_ID || 'template_jmr3xcd';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_EMAILJS_PUBLIC_KEY';

// Initialize EmailJS once (singleton pattern)
let initialized = false;

const initializeEmailJS = () => {
  if (!initialized) {
    emailjs.init(PUBLIC_KEY);
    initialized = true;
  }
};

/**
 * Send welcome email to teacher
 * @param {Object} params - Email parameters
 * @param {string} params.teacher_name - Teacher's name
 * @param {string} params.teacher_email - Teacher's email
 * @param {string} params.teacher_code - Class join code
 * @param {string} params.login_url - Login URL
 */
export const sendTeacherWelcomeEmail = async ({ teacher_name, teacher_email, teacher_code, login_url }) => {
  initializeEmailJS();
  try {
    await emailjs.send(SERVICE_ID, TEACHER_TEMPLATE_ID, {
      teacher_name,
      teacher_email,
      teacher_code,
      login_url
    });
  } catch (error) {
    console.warn('Teacher email send failed:', error);
  }
};

/**
 * Send welcome email to student
 * @param {Object} params - Email parameters
 * @param {string} params.student_name - Student's name
 * @param {string} params.student_email - Student's email
 * @param {string} params.teacher_name - Teacher's name
 * @param {string} params.teacher_code - Class join code
 * @param {string} params.login_url - Login URL
 */
export const sendStudentWelcomeEmail = async ({ student_name, student_email, teacher_name, teacher_code, login_url }) => {
  initializeEmailJS();
  try {
    await emailjs.send(SERVICE_ID, STUDENT_TEMPLATE_ID, {
      student_name,
      student_email,
      teacher_name,
      teacher_code,
      login_url
    });
  } catch (error) {
    console.warn('Student email send failed:', error);
  }
};
