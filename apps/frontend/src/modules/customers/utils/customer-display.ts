import { Customer } from '../types/customer.types';

export function getCustomerDisplayName(customer: Customer) {
  if (customer.customerType === 'COMPANY') {
    return customer.businessName || customer.fullName;
  }
  return customer.fullName || [customer.firstName, customer.lastName].filter(Boolean).join(' ');
}

export function getCustomerSelectLabel(customer: Customer) {
  const name = getCustomerDisplayName(customer);
  return `${name} - ${customer.documentType} ${customer.documentNumber}`;
}

export function getCustomerTypeLabel(type: Customer['customerType']) {
  return type === 'COMPANY' ? 'Empresa' : 'Persona natural';
}
