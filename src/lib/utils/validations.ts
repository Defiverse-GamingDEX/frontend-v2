import { isAddress } from '@ethersproject/address';
import numeral from 'numeral';
import _ from 'lodash';
import i18n from '@/plugins/i18n';

import { bnum } from '.';

export function isRequired(field = '') {
  const _field = field ? `${field} ` : 'Input ';
  return v => !!v || `${_field}${i18n.global.t('isRequired')}`;
}

export function minChar(minLength: number, field = '') {
  const _field = field ? `${field} ` : '';
  return v =>
    !v ||
    v.length >= minLength ||
    `${_field}${i18n.global.t('mustBeAtLeast', [minLength])}`;
}

export function isPositiveCheck(number: number | string) {
  return bnum(number).isGreaterThanOrEqualTo(0);
}
export function isPositive() {
  return v =>
    !v ||
    isPositiveCheck(numeral(v).value() || 0) ||
    i18n.global.t('mustBePositive');
}

export function isLessThanOrEqualTo(max: number | string, msg = '') {
  return v =>
    !v ||
    bnum(v).isLessThanOrEqualTo(max) ||
    (msg ? msg : i18n.global.t('mustBeLessThan', [max]));
}

export const isEmailCheck = email => {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(String(email).toLowerCase());
};

export function isEmail() {
  return v => !v || isEmailCheck(v) || i18n.global.t('mustBeValidEmail');
}

export function isValidAddress() {
  return v => !v || isAddress(v) || i18n.global.t('mustBeValidAddress');
}

export function isGreaterThan(min: number | string, msg = '') {
  return v =>
    !v ||
    bnum(v).isGreaterThan(min) ||
    (msg ? msg : i18n.global.t('mustBeMoreThan', [min]));
}
export function isGreaterThanOrEqualTo(min: number | string, msg = '') {
  return v =>
    !v ||
    bnum(v).isGreaterThanOrEqualTo(min) ||
    (msg ? msg : i18n.global.t('mustBeMoreOrEqualTo', [min]));
}
export function isValidAddressV2() {
  return v => !v || isAddress(v) || i18n.global.t('mustBeValidAddressV2');
}

export type ValidatorName = 'isAddress' | 'isAmount' | 'isInteger';
export type validColType = Record<number, ValidatorName[]>;
/**
 *
 * @param rowText
 * @param validCol: Ex {0: ['isAddress'], 1: ['isAmount'], ...}
 * @returns
 */
export function isRowCheck(rowText: string, validCol: validColType) {
  const s = rowText;
  if (_.isEmpty(_.trim(s))) {
    return false;
  }
  const numCol = Object.keys(validCol).length;
  const pair = s.split(',');
  if (!pair || pair.length !== numCol) {
    return false;
  }
  let valid = true;
  for (let idx = 0; idx < numCol; idx++) {
    const val = _.trim(pair[idx]);
    const amountVal = bnum(val) ?? bnum(0);
    const rules = validCol[idx];
    if (_.isEmpty(val)) {
      valid = false;
      break;
    }
    rules.forEach(rule => {
      if (rule === 'isAddress' && !isAddress(val)) {
        valid = false;
      }
      if (
        rule === 'isAmount' &&
        (amountVal.isNaN() || amountVal.isLessThanOrEqualTo(0))
      ) {
        valid = false;
      }
      if (
        rule === 'isInteger' &&
        (amountVal.isNaN() || !amountVal.isInteger())
      ) {
        valid = false;
      }
    });
  }
  return valid;
}

export function isRowsCheck(text: string, validCol: validColType) {
  const lines = text.trim().split('\n');
  let valid = true;
  for (let index = 0; index < lines.length; index++) {
    if (!isRowCheck(lines[index], validCol)) {
      valid = false;
      break;
    }
  }
  return valid;
}

export function isRowsTextArea(validCol: validColType) {
  return v => !v || isRowsCheck(v, validCol) || i18n.global.t('invalidFormat');
}
