export const HISTORY_STATUS = [
  {
    code: 0,
    type: 'TRANSFER_UNKNOWN',
    name: 'Transfer unknown',
    description: 'Placeholder status',
  },
  {
    code: 1,
    type: 'TRANSFER_SUBMITTING',
    name: 'Transfer submitting',
    description: 'cBridge gateway monitoring on-chain transaction',
  },
  {
    code: 2,
    type: 'TRANSFER_FAILED',
    name: 'Transfer failed',
    description: 'transfer failed, no need to refund',
  },
  {
    code: 3,
    type: 'TRANSFER_WAITING_FOR_SGN_CONFIRMATION',
    name: 'Transfer waiting for sgn confirmation',
    description: 'cBridge gateway waiting for Celer SGN confirmation',
  },
  {
    code: 4,
    type: 'TRANSFER_WAITING_FOR_FUND_RELEASE',
    name: 'Transfer waiting for fund release',
    description: "waiting for user's fund release on destination chain",
  },
  {
    code: 5,
    type: 'TRANSFER_COMPLETED',
    name: 'Transfer completed',
    description: 'Transfer completed',
  },
  {
    code: 6,
    type: 'TRANSFER_TO_BE_REFUNDED',
    name: 'Transfer to be refunded',
    description:
      'Transfer failed, should trigger refund flow, whether it is Pool-Based or Mint/Burn refund',
  },
  {
    code: 7,
    type: 'TRANSFER_REQUESTING_REFUND',
    name: 'Transfer requesting refund',
    description:
      "cBridge gateway is preparing information for user's transfer refund",
  },
  {
    code: 8,
    type: 'TRANSFER_REFUND_TO_BE_CONFIRMED',
    name: 'Transfer refund to be confirmed',
    description:
      'The user should submit on-chain refund transaction based on information provided by this api',
  },
  {
    code: 9,
    type: 'TRANSFER_CONFIRMING_YOUR_REFUND',
    name: 'Transfer confirming your refunding',
    description: 'cBridge monitoring transfer refund status on source chain',
  },
  {
    code: 10,
    type: 'TRANSFER_REFUNDED',
    name: 'Transfer refunded',
    description: 'Transfer refund completed',
  },
  {
    code: 11,
    type: 'TRANSFER_DELAYED',
    name: 'Transfer delayed',
    description: 'Transfer is put into a delayed execution queue',
  },
];
