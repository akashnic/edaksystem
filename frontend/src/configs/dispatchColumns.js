export const getDispatchColumns = (t) => [
  {
    key: "dispatch_id",
    label: t('COL_DISPATCH_ID'),
  },
  {
    key: "dispatch_number",
    label: t('COL_DISPATCH_NO'),
  },
  {
    key: "receive_letter_number",
    label: t('COL_DISPATCH_LETTER_NO'),
  },
  {
    key: "dispatch_date",
    label: t('COL_DISPATCH_DATE'),
    sortable: true,
  },
  {
    key: "receive_subject",
    label: t('COL_DISPATCH_SUBJECT'),
    truncate: true,
  },
  {
    key: "receiver_officer_department",
    label: t('COL_DISPATCH_RECEIVER'),
    sortable: true,
  },
  {
    key: "status",
    label: t('COL_DISPATCH_STATUS'),
    sortable: true,
  },
];
