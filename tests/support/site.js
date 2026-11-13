import { loadEnv } from 'vite';

export const SITE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:5183';
export const WHATSAPP_NUMBER = (process.env.VITE_CONTACT_WHATSAPP ?? loadEnv('test', process.cwd(), 'VITE_CONTACT_').VITE_CONTACT_WHATSAPP ?? '').replace(/\D/g, '');
