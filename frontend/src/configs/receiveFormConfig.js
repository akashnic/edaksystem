export const getReceiveFormFields = (t) => {
  const today = new Date().toISOString().split('T')[0];
  return [
    { name: "letter_number", label: t('FORM_LETTER_NUMBER'), type: "text" },
    { name: "letter_date", label: t('FORM_LETTER_DATE'), type: "date", max: today },
    { name: "subject", label: t('FORM_SUBJECT'), type: "text", required: false },
    { name: "sender_name", label: t('FORM_SENDER_DETAILS'), type: "text", required: false },
    { name: "date_of_receipt", label: t('FORM_DATE_OF_RECEIPT'), type: "date", required: false, max: today },
    { name: "remarks", label: t('FORM_REMARKS'), type: "text", required: false },
    { name: "letter_image", label: t('FORM_LETTER_IMAGE'), type: "image", required: false }
  ];
};
