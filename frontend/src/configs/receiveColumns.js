import React from 'react';

export const getReceiveColumns = (t) => [
  {
    key: "l_id",
    label: t('COL_RECEIVE_ID'),
    sortable: true,
  },
  {
    key: "letter_detail",
    label: t('COL_RECEIVE_LETTER_DETAIL'),
    nowrap: true,
    render: (row) => `${row.letter_number} (${row.letter_date})`,
  },
  {
    key: "sender_name",
    label: t('COL_RECEIVE_SENDER'),
    sortable: true,
    render: (row) => row.sender_name || '-',
  },
  {
    key: "subject",
    label: t('COL_RECEIVE_SUBJECT'),
    truncate: true,
  },
  {
    key: "date_of_receipt",
    label: t('COL_RECEIVE_DATE'),
    sortable: true,
    nowrap: true,
    render: (row) => row.date_of_receipt || '-'
  },
  {
    key: "remarks",
    label: t('COL_RECEIVE_REMARKS'),
  },
  {
    key: "current_status",
    label: t('COL_RECEIVE_STATUS'),
    sortable: true,
  },
];
