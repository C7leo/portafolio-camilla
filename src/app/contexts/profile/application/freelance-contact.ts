/** Public WhatsApp destination supplied by the local/build environment. */
export const freelanceContact = {
  whatsappNumber: (import.meta.env.VITE_CONTACT_WHATSAPP ?? '').replace(/\D/g, ''),
  message: 'Hola, vi tu portafolio y me gustaría conversar contigo sobre un proyecto de desarrollo web.',
} as const;

export const freelanceWhatsappUrl = freelanceContact.whatsappNumber
  ? `https://wa.me/${freelanceContact.whatsappNumber}?text=${encodeURIComponent(freelanceContact.message)}`
  : null;
