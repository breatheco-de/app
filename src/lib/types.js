const SILENT_CODE = {
  USER_EXISTS: 'user-exists',
  USER_INVITE_ACCEPTED_EXISTS: 'user-invite-exists-status-accepted',
  EMAIL_NOT_VALIDATED: 'email-not-validated',
  CARD_ERROR: 'card-error',
  LIST_PROCESSING_ERRORS: ['rate-limit-error', 'invalid-request', 'authentication-error', 'payment-service-are-down', 'stripe-error'],
  UNEXPECTED_EXCEPTION: 'unexpected-exception',
};

export {
  SILENT_CODE,
};
