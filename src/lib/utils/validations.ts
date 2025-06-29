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

export function isAddresAndAmountCheck(
  text: string,
  numAmount: number,
  isAmountInteger: boolean
) {
  const lines = text.trim().split('\n');
  let valid = true;
  for (let index = 0; index < lines.length; index++) {
    const s = lines[index];
    if (_.isEmpty(_.trim(s))) {
      valid = false;
      break;
    }
    const pair = s.split(',');
    if (!pair || pair.length !== numAmount + 1) {
      valid = false;
      break;
    }
    if (!isAddress(_.trim(pair[0]))) {
      valid = false;
      break;
    }

    // check amount
    for (let jdx = 1; jdx <= numAmount; jdx++) {
      let amount = bnum(0);
      try {
        amount = bnum(_.trim(pair[jdx]));
      } catch (err) {
        amount = bnum(0);
      }
      if (amount.isNaN() || amount.isLessThanOrEqualTo(0)) {
        valid = false;
        break;
      }
      if (isAmountInteger && amount.isInteger()) {
        valid = false;
        break;
      }
    }
  }
  return valid;
}

export function isAddresAndAmount(numAmount: number, isAmountInteger: boolean) {
  return v =>
    !v ||
    isAddresAndAmountCheck(v, numAmount, isAmountInteger) ||
    i18n.global.t('invalidFormat');
}
